import { NoteGetRes } from '../modal/NoteGetRes'
import { NoteProperties } from '../modal/NoteProperties'
import { TagGetRes } from '../modal/TagGetRes'
import { NoteCreateRes } from '../modal/NoteCreateRes'
import { NoteUpdateRes } from '../modal/NoteUpdateRes'
import { ResourceGetRes } from '../modal/ResourceGetRes'
import { ajax } from '../util/ajax'
import { PageParam, PageRes } from '../modal/PageData'
import { FieldsParam } from '../modal/FieldsParam'
import { RequiredField } from '../types/RequiredFiled'
// noinspection ES6PreferShortImport
import { PageUtil } from '../util/PageUtil'
import { CommonType } from '../modal/CommonType'
import { ResourceProperties } from '../modal/ResourceProperties'

/**
 * TODO 可以考虑使用 fields() 方法设置然后产生一个新的 Api 实例
 */
class NoteApi {
  async list(): Promise<PageRes<NoteGetRes>>
  async list<K extends keyof NoteProperties = keyof NoteGetRes>(
    pageParam: PageParam<NoteProperties> & FieldsParam<K>,
  ): Promise<PageRes<Pick<NoteProperties, K>>>
  async list(
    pageParam?: PageParam<NoteProperties> & FieldsParam<keyof NoteGetRes>,
  ) {
    return ajax.get<PageRes<NoteGetRes>>('/notes', pageParam)
  }

  async get(id: string): Promise<NoteGetRes & CommonType>
  async get<K extends keyof NoteProperties = keyof NoteGetRes>(
    id: string,
    fields?: K[],
  ): Promise<Pick<NoteProperties, K> & CommonType>
  async get(id: string, fields?: (keyof NoteGetRes)[]) {
    return ajax.get<NoteGetRes & CommonType>(`/notes/${id}`, { fields })
  }

  async create(param: RequiredField<Partial<NoteProperties>, 'title'>) {
    return ajax.post<NoteCreateRes>('/notes', param)
  }

  async update(param: RequiredField<Partial<NoteProperties>, 'id'>) {
    const { id, ...others } = param
    return await ajax.put<NoteUpdateRes>(`/notes/${id}`, others)
  }

  async remove(id: string) {
    return ajax.delete(`/notes/${id}`)
  }

  tagsById(id: string) {
    return PageUtil.pageToAllList(
      ({ id, ...others }) =>
        ajax.get<PageRes<TagGetRes>>(`/notes/${id}/tags`, { ...others }),
      { id } as PageParam<TagGetRes> & { id: string },
    )
  }

  resourcesById(id: string): Promise<ResourceGetRes[]>
  resourcesById<
    K extends keyof ResourceProperties = keyof Omit<ResourceGetRes, 'type_'>
  >(
    id: string,
    fields: K[],
  ): Promise<(Pick<ResourceProperties, K> & CommonType)[]>
  async resourcesById(id: string, fields: string[] = ['id', 'title']) {
    return PageUtil.pageToAllList(
      ({ id, ...others }) =>
        ajax.get<PageRes<ResourceGetRes>>(`/notes/${id}/resources`, {
          fields,
          ...others,
        } as FieldsParam<keyof ResourceGetRes>),
      { id } as PageParam<ResourceGetRes> & { id: string },
    )
  }
}

export const noteApi = new NoteApi()
