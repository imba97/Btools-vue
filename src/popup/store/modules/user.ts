import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule
} from 'vuex-module-decorators'
import store from '@/popup/store'

export interface IUserState {}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {}

export const UserModule = getModule(User)
