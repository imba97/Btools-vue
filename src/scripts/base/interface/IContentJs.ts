import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

export interface IContentJs extends Object {
  type: RequestApiType
  tabId?: number
}
