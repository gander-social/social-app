Pod::Spec.new do |s|
  s.name           = 'EmojiPickerModule'
  s.version        = '1.0.0'
  s.summary        = 'An emoji picker for use in Gander'
  s.description    = 'An emoji picker for use in Gander'
  s.author         = 'alanjhughes'
  s.homepage       = 'https://github.com/gander-social/social-app'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.source         = { git: '' }
  s.swift_version  = '5.4'
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'MCEmojiPicker', '1.2.3'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
