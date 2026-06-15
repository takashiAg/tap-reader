Pod::Spec.new do |s|
  s.name           = 'TapReaderOcr'
  s.version        = '1.0.0'
  s.summary        = 'On-device OCR bridge for Tap Reader'
  s.description    = 'Local Expo module that runs Apple Vision text recognition for Tap Reader.'
  s.author         = 'takashiAg'
  s.homepage       = 'https://github.com/takashiAg/tap-reader'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
