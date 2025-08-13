import React from 'react'
import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useQuery} from '@tanstack/react-query'

import {logEvent} from '#/lib/statsig/statsig'
import {capitalize} from '#/lib/strings/capitalize'
import {logger} from '#/logger'
import {useAgent} from '#/state/session'
import {useOnboardingDispatch} from '#/state/shell'
import {DescriptionText, TitleText} from '#/screens/Onboarding2/Layout'
import {
  type ApiResponseMap,
  Context,
  useInterestsDisplayNames,
} from '#/screens/Onboarding2/state'
import {InterestButton} from '#/screens/Onboarding2/StepInterests/InterestButton'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import * as Toggle from '#/components/forms/Toggle'
import {IconCircle} from '#/components/IconCircle'
import {ArrowRotateCounterClockwise_Stroke2_Corner0_Rounded as ArrowRotateCounterClockwise} from '#/components/icons/ArrowRotateCounterClockwise'
import {EmojiSad_Stroke2_Corner0_Rounded as EmojiSad} from '#/components/icons/Emoji'
import {Hashtag_Stroke2_Corner0_Rounded as Hashtag} from '#/components/icons/Hashtag'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'

export function StepInterests({}: {onGoBack?: () => void}) {
  const {_} = useLingui()
  const t = useTheme()
  useBreakpoints()
  const interestsDisplayNames = useInterestsDisplayNames()

  const {state, dispatch} = React.useContext(Context)
  const [saving, setSaving] = React.useState(false)
  const [interests, setInterests] = React.useState<string[]>(
    state.interestsStepResults.selectedInterests.map(i => i),
  )
  const onboardDispatch = useOnboardingDispatch()
  const agent = useAgent()
  const {isLoading, isError, error, data, refetch, isFetching} = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      try {
        const {data: responseData} =
          await agent.app.bsky.unspecced.getTaggedSuggestions()
        return responseData.suggestions.reduce(
          (agg, s) => {
            const {tag, subject, subjectType} = s
            const isDefault = tag === 'default'

            if (!agg.interests.includes(tag) && !isDefault) {
              agg.interests.push(tag)
            }

            if (subjectType === 'user') {
              agg.suggestedAccountDids[tag] =
                agg.suggestedAccountDids[tag] || []
              agg.suggestedAccountDids[tag].push(subject)
            }

            if (subjectType === 'feed') {
              // agg all feeds into defaults
              if (isDefault) {
                agg.suggestedFeedUris[tag] = agg.suggestedFeedUris[tag] || []
              } else {
                agg.suggestedFeedUris[tag] = agg.suggestedFeedUris[tag] || []
                agg.suggestedFeedUris[tag].push(subject)
                agg.suggestedFeedUris.default.push(subject)
              }
            }

            return agg
          },
          {
            interests: [],
            suggestedAccountDids: {},
            suggestedFeedUris: {},
          } as ApiResponseMap,
        )
      } catch (e: any) {
        logger.info(
          `onboarding: getTaggedSuggestions fetch or processing failed`,
        )
        logger.error(e)

        throw new Error(`a network error occurred`)
      }
    },
  })

  const saveInterests = React.useCallback(async () => {
    setSaving(true)

    try {
      setSaving(false)
      dispatch({
        type: 'setInterestsStepResults',
        apiResponse: data!,
        selectedInterests: interests,
      })
      dispatch({type: 'next'})
      logEvent('onboarding:interests:nextPressed', {
        selectedInterests: interests,
        selectedInterestsLength: interests.length,
      })
    } catch (e: any) {
      logger.info(`onboading: error saving interests`)
      logger.error(e)
    }
  }, [interests, data, setSaving, dispatch])

  const skipOnboarding = React.useCallback(() => {
    onboardDispatch({type: 'finish'})
    dispatch({type: 'finish'})
  }, [onboardDispatch, dispatch])

  const title = isError ? (
    <Trans>Oh no! Something went wrong.</Trans>
  ) : (
    <Trans>What are your interests?</Trans>
  )
  const description = isError ? (
    <Trans>
      We weren't able to connect. Please try again to continue setting up your
      account. If it continues to fail, you can skip this flow.
    </Trans>
  ) : (
    <Trans>We'll use this to help customize your experience.</Trans>
  )

  return (
    <View style={[a.align_start]} testID="onboardingInterests">
      <IconCircle
        icon={isError ? EmojiSad : Hashtag}
        style={[
          a.mb_2xl,
          isError
            ? {
                backgroundColor: t.palette.negative_50,
              }
            : {},
        ]}
        iconStyle={[
          isError
            ? {
                color: t.palette.negative_900,
              }
            : {},
        ]}
      />

      <TitleText>{title}</TitleText>
      <DescriptionText>{description}</DescriptionText>

      <View style={[a.w_full, a.pt_2xl]}>
        {isLoading ? (
          <Loader size="xl" />
        ) : isError || !data ? (
          <View
            style={[
              a.w_full,
              a.p_lg,
              a.rounded_md,
              {
                backgroundColor: t.palette.negative_50,
              },
            ]}>
            <Text style={[a.text_md]}>
              <Text
                style={[
                  a.text_md,
                  a.font_bold,
                  {
                    color: t.palette.negative_900,
                  },
                ]}>
                <Trans>Error:</Trans>{' '}
              </Text>
              {error?.message || _(msg`an unknown error occurred`)}
            </Text>
          </View>
        ) : (
          <Toggle.Group
            values={interests}
            onChange={setInterests}
            label={_(msg`Select your interests from the options below`)}>
            <View style={[a.flex_row, a.gap_md, a.flex_wrap]}>
              {data.interests.map(interest => (
                <Toggle.Item
                  key={interest}
                  name={interest}
                  label={
                    interestsDisplayNames[interest] || capitalize(interest)
                  }>
                  <InterestButton interest={interest} />
                </Toggle.Item>
              ))}
            </View>
          </Toggle.Group>
        )}
      </View>

      <View
        style={[a.border_t, a.w_full, {borderColor: '#D8D8D8', borderWidth: 1}]}
      />
      {isError ? (
        <View style={[a.flex_row, a.align_center, a.pt_lg]}>
          <Button
            disabled={isFetching}
            variant="solid"
            color="secondary"
            size="large"
            label={_(msg`Retry`)}
            onPress={() => refetch()}>
            <ButtonText>
              <Trans>Retry</Trans>
            </ButtonText>
            <ButtonIcon icon={ArrowRotateCounterClockwise} position="right" />
          </Button>
          <View style={a.flex_1} />
          <Button
            variant="outline"
            color="secondary"
            size="large"
            label={_(msg`Skip this flow`)}
            onPress={skipOnboarding}>
            <ButtonText>
              <Trans>Skip</Trans>
            </ButtonText>
          </Button>
        </View>
      ) : (
        <View style={[a.flex_row, a.align_center, a.pt_lg]}>
          <Button
            label={_(msg`Go back to previous step`)}
            variant="solid"
            color="secondary"
            size="large"
            onPress={() => dispatch({type: 'prev'})}>
            <ButtonText>
              <Trans>Back</Trans>
            </ButtonText>
          </Button>
          <View style={a.flex_1} />
          <Button
            testID="nextBtn"
            label={_(msg`Continue to next step`)}
            variant="solid"
            color="primary"
            size="large"
            disabled={saving || !data}
            onPress={saveInterests}>
            <ButtonText>
              <Trans>Next</Trans>
            </ButtonText>
            {saving && <ButtonIcon icon={Loader} />}
          </Button>
        </View>
      )}
    </View>
  )
}
