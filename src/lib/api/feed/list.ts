import {
  type Agent,
  type AppGndrFeedDefs,
  type AppGndrFeedGetListFeed as GetListFeed,
} from '@atproto/api'

import {type FeedAPI, type FeedAPIResponse} from './types'

export class ListFeedAPI implements FeedAPI {
  agent: Agent
  params: GetListFeed.QueryParams

  constructor({
    agent,
    feedParams,
  }: {
    agent: Agent
    feedParams: GetListFeed.QueryParams
  }) {
    this.agent = agent
    this.params = feedParams
  }

  async peekLatest(): Promise<AppGndrFeedDefs.FeedViewPost> {
    const res = await this.agent.app.gndr.feed.getListFeed({
      ...this.params,
      limit: 1,
    })
    return res.data.feed[0]
  }

  async fetch({
    cursor,
    limit,
  }: {
    cursor: string | undefined
    limit: number
  }): Promise<FeedAPIResponse> {
    const res = await this.agent.app.gndr.feed.getListFeed({
      ...this.params,
      cursor,
      limit,
    })
    if (res.success) {
      return {
        cursor: res.data.cursor,
        feed: res.data.feed,
      }
    }
    return {
      feed: [],
    }
  }
}
