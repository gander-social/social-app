import { View, Image } from 'react-native'
import { atoms as a, useTheme } from '#/alf'
import { Text } from '#/components/Typography'
import * as Grid from '#/components/Grid'

export function InterestsCard({ image }: any) {
  return (
    <>
      <View>
        <Grid.Row gap={a.gap_sm.gap}>
          <Grid.Col width={1 / 2}>
            <Image source={image} style={{ width: 300, height: 300, borderRadius: 20 }} />
            <View>
              <Text>Caption</Text>
            </View>
          </Grid.Col>
          <Grid.Col width={1 / 2}>
            <Image source={image} style={{ width: 300, height: 300, borderRadius: 20 }} />
            <View>
              <Text>Caption</Text>
            </View>
          </Grid.Col>
        </Grid.Row >
        <Grid.Row gap={a.gap_sm.gap}>
          <Grid.Col width={1 / 2}>
            <Image source={image} style={{ width: 300, height: 300, borderRadius: 20 }} />
            <View>
              <Text>Caption</Text>
            </View>
          </Grid.Col>
          <Grid.Col width={1 / 2}>
            <Image source={image} style={{ width: 300, height: 300, borderRadius: 20 }} />
            <View>
              <Text>Caption</Text>
            </View>
          </Grid.Col>
        </Grid.Row >
      </View>
    </>
  )
}
