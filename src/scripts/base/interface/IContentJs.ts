import { ContentJsType } from '@/scripts/base/enums/contentJsType'

export interface IContentJs extends Object {
  type: ContentJsType
  tabId?: number
}
