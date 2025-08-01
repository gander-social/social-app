import {type AppGndrActorGetProfile} from '@atproto/api'
import {useMutation} from '@tanstack/react-query'

import {until} from '#/lib/async/until'
import {logger} from '#/logger'
import {useUpdateProfileVerificationCache} from '#/state/queries/verification/useUpdateProfileVerificationCache'
import {useAgent, useSession} from '#/state/session'
import type * as gndr from '#/types/gndr'

export function useVerificationCreateMutation() {
  const agent = useAgent()
  const {currentAccount} = useSession()
  const updateProfileVerificationCache = useUpdateProfileVerificationCache()

  return useMutation({
    async mutationFn({profile}: {profile: gndr.profile.AnyProfileView}) {
      if (!currentAccount) {
        throw new Error('User not logged in')
      }

      const {uri} = await agent.app.gndr.graph.verification.create(
        {repo: currentAccount.did},
        {
          subject: profile.did,
          createdAt: new Date().toISOString(),
          handle: profile.handle,
          displayName: profile.displayName || '',
        },
      )

      await until(
        5,
        1e3,
        ({data: profile}: AppGndrActorGetProfile.Response) => {
          if (
            profile.verification &&
            profile.verification.verifications.find(v => v.uri === uri)
          ) {
            return true
          }
          return false
        },
        () => {
          return agent.getProfile({actor: profile.did ?? ''})
        },
      )
    },
    async onSuccess(_, {profile}) {
      logger.metric('verification:create', {}, {statsig: true})
      await updateProfileVerificationCache({profile})
    },
  })
}
