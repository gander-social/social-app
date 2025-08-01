import {StyleProp, View, ViewStyle} from 'react-native'
import {AppGndrFeedDefs, ComAtprotoLabelDefs} from '@atproto/api'
import {msg, Plural, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useSession} from '#/state/session'
import {atoms as a} from '#/alf'
import {Button, ButtonIcon, ButtonSize, ButtonText} from '#/components/Button'
import {CircleInfo_Stroke2_Corner0_Rounded as CircleInfo} from '#/components/icons/CircleInfo'
import {
  LabelsOnMeDialog,
  useLabelsOnMeDialogControl,
} from '#/components/moderation/LabelsOnMeDialog'

export function LabelsOnMe({
  type,
  labels,
  size,
  style,
}: {
  type: 'account' | 'content'
  labels: ComAtprotoLabelDefs.Label[] | undefined
  size?: ButtonSize
  style?: StyleProp<ViewStyle>
}) {
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const control = useLabelsOnMeDialogControl()

  if (!labels || !currentAccount) {
    return null
  }
  labels = labels.filter(l => !l.val.startsWith('!'))
  if (!labels.length) {
    return null
  }

  return (
    <View style={[a.flex_row, style]}>
      <LabelsOnMeDialog control={control} labels={labels} type={type} />

      <Button
        variant="solid"
        color="secondary"
        size={size || 'small'}
        label={_(msg`View information about these labels`)}
        onPress={() => {
          control.open()
        }}>
        <ButtonIcon position="left" icon={CircleInfo} />
        <ButtonText style={[a.leading_snug]}>
          {type === 'account' ? (
            <Trans>
              <Plural
                value={labels.length}
                one="# label has"
                other="# labels have"
              />{' '}
              been placed on this account
            </Trans>
          ) : (
            <Trans>
              <Plural
                value={labels.length}
                one="# label has"
                other="# labels have"
              />{' '}
              been placed on this content
            </Trans>
          )}
        </ButtonText>
      </Button>
    </View>
  )
}

export function LabelsOnMyPost({
  post,
  style,
}: {
  post: AppGndrFeedDefs.PostView
  style?: StyleProp<ViewStyle>
}) {
  const {currentAccount} = useSession()
  if (post.author.did !== currentAccount?.did) {
    return null
  }
  return (
    <LabelsOnMe type="content" labels={post.labels} size="tiny" style={style} />
  )
}
