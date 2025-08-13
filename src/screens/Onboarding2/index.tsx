import React from 'react'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {Onboarding2Layout} from '#/screens/Onboarding2/Layout'
import {Context, initialState, reducer} from '#/screens/Onboarding2/state'
import {StepFinished} from '#/screens/Onboarding2/StepFinished'
import {StepInterests} from '#/screens/Onboarding2/StepInterests'
import {StepProfile} from '#/screens/Onboarding2/StepProfile'
import {Portal} from '#/components/Portal'

export function Onboarding2({
  onGoBack,
  onCancel,
  handle,
}: {
  onGoBack?: () => void
  onCancel?: () => void
  handle?: string
}) {
  const {_} = useLingui()
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
  })

  const interestsDisplayNames = React.useMemo(() => {
    return {
      news: _(msg`News`),
      journalism: _(msg`Journalism`),
      nature: _(msg`Nature`),
      art: _(msg`Art`),
      comics: _(msg`Comics`),
      writers: _(msg`Writers`),
      culture: _(msg`Culture`),
      sports: _(msg`Sports`),
      pets: _(msg`Pets`),
      animals: _(msg`Animals`),
      books: _(msg`Books`),
      education: _(msg`Education`),
      climate: _(msg`Climate`),
      science: _(msg`Science`),
      politics: _(msg`Politics`),
      fitness: _(msg`Fitness`),
      tech: _(msg`Tech`),
      dev: _(msg`Software Dev`),
      comedy: _(msg`Comedy`),
      gaming: _(msg`Video Games`),
      food: _(msg`Food`),
      cooking: _(msg`Cooking`),
    }
  }, [_])

  return (
    <Portal>
      <Context.Provider
        value={React.useMemo(
          () => ({state, dispatch, interestsDisplayNames}),
          [state, dispatch, interestsDisplayNames],
        )}>
        <Onboarding2Layout
          onGoBack={onGoBack}
          onCancel={onCancel}
          handle={handle}>
          {state.activeStep === 'profile' && (
            <StepProfile onGoBack={onGoBack} handle={handle} />
          )}
          {state.activeStep === 'interests' && (
            <StepInterests onGoBack={onGoBack} />
          )}
          {state.activeStep === 'finished' && <StepFinished />}
        </Onboarding2Layout>
      </Context.Provider>
    </Portal>
  )
}
