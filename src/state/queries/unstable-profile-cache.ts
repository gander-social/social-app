import {useCallback} from 'react'
import {QueryClient, useQueryClient} from '@tanstack/react-query'

import * as gndr from '#/types/gndr'

const unstableProfileViewCacheQueryKeyRoot = 'unstableProfileViewCache'
export const unstableProfileViewCacheQueryKey = (didOrHandle: string) => [
  unstableProfileViewCacheQueryKeyRoot,
  didOrHandle,
]

/**
 * Used as a rough cache of profile views to make loading snappier. This method
 * accepts and stores any profile view type by both handle and DID.
 *
 * Access the cache via {@link useUnstableProfileViewCache}.
 */
export function unstableCacheProfileView(
  queryClient: QueryClient,
  profile: gndr.profile.AnyProfileView,
) {
  queryClient.setQueryData(
    unstableProfileViewCacheQueryKey(profile.handle),
    profile,
  )
  queryClient.setQueryData(
    unstableProfileViewCacheQueryKey(profile.did),
    profile,
  )
}

/**
 * Hook to access the unstable profile view cache. This cache can return ANY
 * profile view type, so if the object shape is important, you need to use the
 * identity validators shipped in the atproto SDK e.g.
 * `AppGndrActorDefs.isValidProfileViewBasic` to confirm before using.
 *
 * To cache a profile, use {@link unstableCacheProfileView}.
 */
export function useUnstableProfileViewCache() {
  const qc = useQueryClient()
  const getUnstableProfile = useCallback(
    (didOrHandle: string) => {
      return qc.getQueryData<gndr.profile.AnyProfileView>(
        unstableProfileViewCacheQueryKey(didOrHandle),
      )
    },
    [qc],
  )
  return {getUnstableProfile}
}
