import {
  type GndrAgent,
  type ChatGndrActorDefs,
  type ChatGndrConvoDefs,
  type ChatGndrConvoSendMessage,
} from '@atproto/api'

import {type MessagesEventBus} from '#/state/messages/events/agent'

export type ConvoParams = {
  convoId: string
  agent: GndrAgent
  events: MessagesEventBus
  placeholderData?: {
    convo: ChatGndrConvoDefs.ConvoView
  }
}

export enum ConvoStatus {
  Uninitialized = 'uninitialized',
  Initializing = 'initializing',
  Ready = 'ready',
  Error = 'error',
  Backgrounded = 'backgrounded',
  Suspended = 'suspended',
  Disabled = 'disabled',
}

export enum ConvoItemError {
  /**
   * Error connecting to event firehose
   */
  FirehoseFailed = 'firehoseFailed',
  /**
   * Error fetching past messages
   */
  HistoryFailed = 'historyFailed',
}

export enum ConvoErrorCode {
  InitFailed = 'initFailed',
}

export type ConvoError = {
  code: ConvoErrorCode
  exception?: Error
  retry: () => void
}

export enum ConvoDispatchEvent {
  Init = 'init',
  Ready = 'ready',
  Resume = 'resume',
  Background = 'background',
  Suspend = 'suspend',
  Error = 'error',
  Disable = 'disable',
}

export type ConvoDispatch =
  | {
      event: ConvoDispatchEvent.Init
    }
  | {
      event: ConvoDispatchEvent.Ready
    }
  | {
      event: ConvoDispatchEvent.Resume
    }
  | {
      event: ConvoDispatchEvent.Background
    }
  | {
      event: ConvoDispatchEvent.Suspend
    }
  | {
      event: ConvoDispatchEvent.Error
      payload: ConvoError
    }
  | {
      event: ConvoDispatchEvent.Disable
    }

export type ConvoItem =
  | {
      type: 'message'
      key: string
      message: ChatGndrConvoDefs.MessageView
      nextMessage:
        | ChatGndrConvoDefs.MessageView
        | ChatGndrConvoDefs.DeletedMessageView
        | null
      prevMessage:
        | ChatGndrConvoDefs.MessageView
        | ChatGndrConvoDefs.DeletedMessageView
        | null
    }
  | {
      type: 'pending-message'
      key: string
      message: ChatGndrConvoDefs.MessageView
      nextMessage:
        | ChatGndrConvoDefs.MessageView
        | ChatGndrConvoDefs.DeletedMessageView
        | null
      prevMessage:
        | ChatGndrConvoDefs.MessageView
        | ChatGndrConvoDefs.DeletedMessageView
        | null
      failed: boolean
      /**
       * Retry sending the message. If present, the message is in a failed state.
       */
      retry?: () => void
    }
  | {
      type: 'deleted-message'
      key: string
      message: ChatGndrConvoDefs.DeletedMessageView
      nextMessage:
        | ChatGndrConvoDefs.MessageView
        | ChatGndrConvoDefs.DeletedMessageView
        | null
      prevMessage:
        | ChatGndrConvoDefs.MessageView
        | ChatGndrConvoDefs.DeletedMessageView
        | null
    }
  | {
      type: 'error'
      key: string
      code: ConvoItemError
      /**
       * If present, error is recoverable.
       */
      retry?: () => void
    }

type DeleteMessage = (messageId: string) => Promise<void>
type SendMessage = (
  message: ChatGndrConvoSendMessage.InputSchema['message'],
) => void
type FetchMessageHistory = () => Promise<void>
type MarkConvoAccepted = () => void
type AddReaction = (messageId: string, reaction: string) => Promise<void>
type RemoveReaction = (messageId: string, reaction: string) => Promise<void>

export type ConvoStateUninitialized = {
  status: ConvoStatus.Uninitialized
  items: []
  convo: ChatGndrConvoDefs.ConvoView | undefined
  error: undefined
  sender: ChatGndrActorDefs.ProfileViewBasic | undefined
  recipients: ChatGndrActorDefs.ProfileViewBasic[] | undefined
  isFetchingHistory: false
  deleteMessage: undefined
  sendMessage: undefined
  fetchMessageHistory: undefined
  markConvoAccepted: undefined
  addReaction: undefined
  removeReaction: undefined
}
export type ConvoStateInitializing = {
  status: ConvoStatus.Initializing
  items: []
  convo: ChatGndrConvoDefs.ConvoView | undefined
  error: undefined
  sender: ChatGndrActorDefs.ProfileViewBasic | undefined
  recipients: ChatGndrActorDefs.ProfileViewBasic[] | undefined
  isFetchingHistory: boolean
  deleteMessage: undefined
  sendMessage: undefined
  fetchMessageHistory: undefined
  markConvoAccepted: undefined
  addReaction: undefined
  removeReaction: undefined
}
export type ConvoStateReady = {
  status: ConvoStatus.Ready
  items: ConvoItem[]
  convo: ChatGndrConvoDefs.ConvoView
  error: undefined
  sender: ChatGndrActorDefs.ProfileViewBasic
  recipients: ChatGndrActorDefs.ProfileViewBasic[]
  isFetchingHistory: boolean
  deleteMessage: DeleteMessage
  sendMessage: SendMessage
  fetchMessageHistory: FetchMessageHistory
  markConvoAccepted: MarkConvoAccepted
  addReaction: AddReaction
  removeReaction: RemoveReaction
}
export type ConvoStateBackgrounded = {
  status: ConvoStatus.Backgrounded
  items: ConvoItem[]
  convo: ChatGndrConvoDefs.ConvoView
  error: undefined
  sender: ChatGndrActorDefs.ProfileViewBasic
  recipients: ChatGndrActorDefs.ProfileViewBasic[]
  isFetchingHistory: boolean
  deleteMessage: DeleteMessage
  sendMessage: SendMessage
  fetchMessageHistory: FetchMessageHistory
  markConvoAccepted: MarkConvoAccepted
  addReaction: AddReaction
  removeReaction: RemoveReaction
}
export type ConvoStateSuspended = {
  status: ConvoStatus.Suspended
  items: ConvoItem[]
  convo: ChatGndrConvoDefs.ConvoView
  error: undefined
  sender: ChatGndrActorDefs.ProfileViewBasic
  recipients: ChatGndrActorDefs.ProfileViewBasic[]
  isFetchingHistory: boolean
  deleteMessage: DeleteMessage
  sendMessage: SendMessage
  fetchMessageHistory: FetchMessageHistory
  markConvoAccepted: MarkConvoAccepted
  addReaction: AddReaction
  removeReaction: RemoveReaction
}
export type ConvoStateError = {
  status: ConvoStatus.Error
  items: []
  convo: undefined
  error: ConvoError
  sender: undefined
  recipients: undefined
  isFetchingHistory: false
  deleteMessage: undefined
  sendMessage: undefined
  fetchMessageHistory: undefined
  markConvoAccepted: undefined
  addReaction: undefined
  removeReaction: undefined
}
export type ConvoStateDisabled = {
  status: ConvoStatus.Disabled
  items: ConvoItem[]
  convo: ChatGndrConvoDefs.ConvoView
  error: undefined
  sender: ChatGndrActorDefs.ProfileViewBasic
  recipients: ChatGndrActorDefs.ProfileViewBasic[]
  isFetchingHistory: boolean
  deleteMessage: DeleteMessage
  sendMessage: SendMessage
  fetchMessageHistory: FetchMessageHistory
  markConvoAccepted: MarkConvoAccepted
  addReaction: AddReaction
  removeReaction: RemoveReaction
}
export type ConvoState =
  | ConvoStateUninitialized
  | ConvoStateInitializing
  | ConvoStateReady
  | ConvoStateBackgrounded
  | ConvoStateSuspended
  | ConvoStateError
  | ConvoStateDisabled

export type ConvoEvent = {
  type: 'invalidate-block-state'
  accountDids: string[]
}
