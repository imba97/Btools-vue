import { IVideoData } from '@/scripts/base/storage/template'

export interface IChannelList {
  [uid: number]: {
    [cid: number]: {
      title: string
      videos: IVideoData[]
    }
  }
}
