import { IVideoData } from '@/scripts/base/storage/template'

export interface IChannelList {
  [uid: number]: {
    [sid: number]: {
      title: string
      videos: IVideoData[]
    }
  }
}
