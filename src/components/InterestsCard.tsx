import { View, Image } from 'react-native'
import { atoms as a, useTheme } from '#/alf'
import { Text } from '#/components/Typography'

export function InterestsCard({ image }: any) {
  return (
    <>
      <View><Image source={image} style={{ width: 400, height: 400, borderRadius: 20 }} /></View>
      <View>
        <Text>Hi there</Text>
      </View>
    </>
  )
}
