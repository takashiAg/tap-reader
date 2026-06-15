import ExpoModulesCore
import UIKit
import Vision

public class TapReaderOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TapReaderOcr")

    AsyncFunction("recognizeImage") { (uri: String, languageId: String, mode: String) throws -> [String: Any] in
      let imageUrl = try resolveImageUrl(uri)
      guard let image = UIImage(contentsOfFile: imageUrl.path), let cgImage = image.cgImage else {
        throw OcrException("Unable to load image at \(uri)")
      }

      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      request.automaticallyDetectsLanguage = true

      let languageHints = recognitionLanguages(for: languageId)
      if !languageHints.isEmpty {
        request.recognitionLanguages = languageHints
      }

      let handler = VNImageRequestHandler(cgImage: cgImage, orientation: image.cgImagePropertyOrientation)
      try handler.perform([request])

      let tokens = (request.results ?? []).enumerated().flatMap { observationIndex, observation in
        recognizedTokens(from: observation, observationIndex: observationIndex, languageId: languageId, mode: mode)
      }

      return [
        "languageId": languageId,
        "mode": mode,
        "capturedAt": Int(Date().timeIntervalSince1970 * 1000),
        "tokens": tokens
      ]
    }
  }
}

private func resolveImageUrl(_ uri: String) throws -> URL {
  if uri.hasPrefix("file://"), let url = URL(string: uri) {
    return url
  }

  if FileManager.default.fileExists(atPath: uri) {
    return URL(fileURLWithPath: uri)
  }

  throw OcrException("Unsupported image uri: \(uri)")
}

private func recognitionLanguages(for languageId: String) -> [String] {
  switch languageId {
  case "ko":
    return ["ko-KR"]
  case "ja":
    return ["ja-JP"]
  case "zh":
    return ["zh-Hans", "zh-Hant"]
  case "en":
    return ["en-US"]
  default:
    return []
  }
}

private func recognizedTokens(
  from observation: VNRecognizedTextObservation,
  observationIndex: Int,
  languageId: String,
  mode: String
) -> [[String: Any]] {
  guard let candidate = observation.topCandidates(1).first else {
    return []
  }

  let text = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
  if text.isEmpty {
    return []
  }

  if mode == "character" {
    return Array(text).enumerated().compactMap { characterIndex, character in
      let characterText = String(character)
      let stringIndex = text.index(text.startIndex, offsetBy: characterIndex)
      let range = stringIndex..<text.index(after: stringIndex)
      let box = (try? candidate.boundingBox(for: range)) ?? observation.boundingBox

      return tokenDictionary(
        id: "\(languageId)-\(observationIndex)-char-\(characterIndex)-\(characterText)",
        text: characterText,
        bounds: box,
        confidence: candidate.confidence
      )
    }
  }

  let words = text
    .split(whereSeparator: { $0.isWhitespace || $0.isPunctuation })
    .map(String.init)

  if words.isEmpty {
    return [
      tokenDictionary(
        id: "\(languageId)-\(observationIndex)-line",
        text: text,
        bounds: observation.boundingBox,
        confidence: candidate.confidence
      )
    ]
  }

  var searchStart = text.startIndex
  return words.enumerated().compactMap { wordIndex, word in
    guard let range = text.range(of: word, range: searchStart..<text.endIndex) else {
      return nil
    }

    searchStart = range.upperBound
    let box = (try? candidate.boundingBox(for: range)) ?? observation.boundingBox

    return tokenDictionary(
      id: "\(languageId)-\(observationIndex)-word-\(wordIndex)-\(word)",
      text: word,
      bounds: box,
      confidence: candidate.confidence
    )
  }
}

private func tokenDictionary(id: String, text: String, bounds: CGRect, confidence: Float) -> [String: Any] {
  return [
    "id": id,
    "text": text,
    "bounds": [
      "x": max(0, min(1, bounds.minX)),
      "y": max(0, min(1, 1 - bounds.maxY)),
      "width": max(0.02, min(1, bounds.width)),
      "height": max(0.02, min(1, bounds.height))
    ],
    "confidence": confidence
  ]
}

private extension UIImage {
  var cgImagePropertyOrientation: CGImagePropertyOrientation {
    switch imageOrientation {
    case .up:
      return .up
    case .down:
      return .down
    case .left:
      return .left
    case .right:
      return .right
    case .upMirrored:
      return .upMirrored
    case .downMirrored:
      return .downMirrored
    case .leftMirrored:
      return .leftMirrored
    case .rightMirrored:
      return .rightMirrored
    @unknown default:
      return .up
    }
  }
}

private class OcrException: Exception {
  private let message: String

  init(_ message: String) {
    self.message = message
  }

  override var reason: String {
    message
  }
}
