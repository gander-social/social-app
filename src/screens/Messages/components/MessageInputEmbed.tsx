import {useCallback, useEffect, useMemo, useState} from 'react'
import {LayoutAnimation, View} from 'react-native'
import {
  AppGndrFeedPost,
  AppGndrRichtextFacet,
  AtUri,
  moderatePost,
  RichText as RichTextAPI,
} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'

import {makeProfileLink} from '#/lib/routes/links'
import {CommonNavigatorParams, NavigationProp} from '#/lib/routes/types'
import {
  convertGndrAppUrlIfNeeded,
  isGndrPostUrl,
  makeRecordUri,
} from '#/lib/strings/url-helpers'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {usePostQuery} from '#/state/queries/post'
import {PostMeta} from '#/view/com/util/PostMeta'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonIcon} from '#/components/Button'
import {TimesLarge_Stroke2_Corner0_Rounded as X} from '#/components/icons/Times'
import {Loader} from '#/components/Loader'
import * as MediaPreview from '#/components/MediaPreview'
import {ContentHider} from '#/components/moderation/ContentHider'
import {PostAlerts} from '#/components/moderation/PostAlerts'
import {RichText} from '#/components/RichText'
import {Text} from '#/components/Typography'
import * as gndr from '#/types/gndr'

export function useMessageEmbed() {
  const route =
    useRoute<RouteProp<CommonNavigatorParams, 'MessagesConversation'>>()
  const navigation = useNavigation<NavigationProp>()
  const embedFromParams = route.params.embed

  const [embedUri, setEmbed] = useState(embedFromParams)

  if (embedFromParams && embedUri !== embedFromParams) {
    setEmbed(embedFromParams)
  }

  return {
    embedUri,
    setEmbed: useCallback(
      (embedUrl: string | undefined) => {
        if (!embedUrl) {
          navigation.setParams({embed: ''})
          setEmbed(undefined)
          return
        }

        if (embedFromParams) return

        const url = convertGndrAppUrlIfNeeded(embedUrl)
        const [_0, user, _1, rkey] = url.split('/').filter(Boolean)
        const uri = makeRecordUri(user, 'app.gndr.feed.post', rkey)

        setEmbed(uri)
      },
      [embedFromParams, navigation],
    ),
  }
}

export function useExtractEmbedFromFacets(
  message: string,
  setEmbed: (embedUrl: string | undefined) => void,
) {
  const rt = new RichTextAPI({text: message})
  rt.detectFacetsWithoutResolution()

  let uriFromFacet: string | undefined

  for (const facet of rt.facets ?? []) {
    for (const feature of facet.features) {
      if (AppGndrRichtextFacet.isLink(feature) && isGndrPostUrl(feature.uri)) {
        uriFromFacet = feature.uri
        break
      }
    }
  }

  useEffect(() => {
    if (uriFromFacet) {
      setEmbed(uriFromFacet)
    }
  }, [uriFromFacet, setEmbed])
}

export function MessageInputEmbed({
  embedUri,
  setEmbed,
}: {
  embedUri: string | undefined
  setEmbed: (embedUrl: string | undefined) => void
}) {
  const t = useTheme()
  const {_} = useLingui()

  const {data: post, status} = usePostQuery(embedUri)

  const moderationOpts = useModerationOpts()
  const moderation = useMemo(
    () =>
      moderationOpts && post ? moderatePost(post, moderationOpts) : undefined,
    [moderationOpts, post],
  )

  const {rt, record} = useMemo(() => {
    if (
      post &&
      gndr.dangerousIsType<AppGndrFeedPost.Record>(
        post.record,
        AppGndrFeedPost.isRecord,
      )
    ) {
      return {
        rt: new RichTextAPI({
          text: post.record.text,
          facets: post.record.facets,
        }),
        record: post.record,
      }
    }

    return {rt: undefined, record: undefined}
  }, [post])

  if (!embedUri) {
    return null
  }

  let content = null
  switch (status) {
    case 'pending':
      content = (
        <View
          style={[a.flex_1, {minHeight: 64}, a.justify_center, a.align_center]}>
          <Loader />
        </View>
      )
      break
    case 'error':
      content = (
        <View
          style={[a.flex_1, {minHeight: 64}, a.justify_center, a.align_center]}>
          <Text style={a.text_center}>Could not fetch post</Text>
        </View>
      )
      break
    case 'success':
      const itemUrip = new AtUri(post.uri)
      const itemHref = makeProfileLink(post.author, 'post', itemUrip.rkey)

      if (!post || !moderation || !rt || !record) {
        return null
      }

      content = (
        <View
          style={[
            a.flex_1,
            t.atoms.bg,
            t.atoms.border_contrast_low,
            a.rounded_md,
            a.border,
            a.p_sm,
            a.mb_sm,
          ]}
          pointerEvents="none">
          <PostMeta
            showAvatar
            author={post.author}
            moderation={moderation}
            timestamp={post.indexedAt}
            postHref={itemHref}
            style={a.flex_0}
          />
          <ContentHider modui={moderation.ui('contentView')}>
            <PostAlerts modui={moderation.ui('contentView')} style={a.py_xs} />
            {rt.text && (
              <View style={a.mt_xs}>
                <RichText
                  enableTags
                  testID="postText"
                  value={rt}
                  style={[a.text_sm, t.atoms.text_contrast_high]}
                  authorHandle={post.author.handle}
                  numberOfLines={3}
                />
              </View>
            )}
            <MediaPreview.Embed embed={post.embed} style={a.mt_sm} />
          </ContentHider>
        </View>
      )
      break
  }

  return (
    <View style={[a.flex_row, a.gap_sm]}>
      {content}
      <Button
        label={_(msg`Remove embed`)}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          setEmbed(undefined)
        }}
        size="tiny"
        variant="solid"
        color="secondary"
        shape="round">
        <ButtonIcon icon={X} />
      </Button>
    </View>
  )
}
