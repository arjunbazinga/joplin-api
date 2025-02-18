import { ResourceProperties } from '../modal/ResourceProperties'
import { ResourceGetRes } from '../modal/ResourceGetRes'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { ajax } from '../util/ajax'
import { ApiUtil } from '../util/ApiUtil'
import { ReadStream } from 'fs'
import { PageParam, PageRes } from '../modal/PageData'
import { FieldsParam } from '../modal/FieldsParam'
import { CommonType } from '../modal/CommonType'

/**
 * 附件资源相关 api
 */
class ResourceApi {
  async list(): Promise<PageRes<ResourceGetRes>>
  async list<K extends keyof ResourceProperties>(
    pageParam: PageParam<ResourceProperties> & FieldsParam<K>,
  ): Promise<PageRes<Pick<ResourceProperties, K>>>
  async list(
    pageParam?: PageParam<ResourceProperties> & FieldsParam<ResourceGetRes>,
  ) {
    return await ajax.get<PageRes<ResourceGetRes>>('/resources', pageParam)
  }

  async get(id: string): Promise<ResourceGetRes>
  async get<
    K extends keyof ResourceProperties = keyof Omit<ResourceGetRes, 'type_'>
  >(id: string, fields: K[]): Promise<Pick<ResourceProperties, K> & CommonType>
  async get<
    K extends keyof ResourceProperties = keyof Omit<ResourceGetRes, 'type_'>
  >(id: string, fields?: K[]) {
    return await ajax.get<ResourceGetRes>(`/resources/${id}`, { fields })
  }

  /**
   * Creates a new resource
   * Creating a new resource is special because you also need to upload the file. Unlike other API calls, this one must have the "multipart/form-data" Content-Type. The file data must be passed to the "data" form field, and the other properties to the "props" form field. An example of a valid call with cURL would be:
   * The "data" field is required, while the "props" one is not. If not specified, default values will be used.
   * @param param
   */
  async create(param: { data: ReadStream; title: string }) {
    const fd = new FormData()
    fd.append('props', JSON.stringify({ title: param.title }))
    fd.append('data', param.data)
    const resp = await fetch(ApiUtil.baseUrl('/resources'), {
      method: 'post',
      body: fd,
    })
    return (await resp.json()) as ResourceGetRes
  }

  async update(param: Pick<ResourceProperties, 'id' | 'title'>) {
    const { id, ...others } = param
    return await ajax.put<ResourceGetRes>(`/resources/${id}`, others)
  }

  /**
   * TODO 这个 api 存在 bug
   * @link https://discourse.joplinapp.org/t/pre-release-1-4-is-now-available-for-testing/12247/15?u=rxliuli
   * @param id
   */
  async remove(id: string) {
    return await ajax.delete(`/resources/${id}`)
  }

  /**
   * Gets the actual file associated with this resource.
   * @param id
   */
  async fileByResourceId(id: string) {
    const resp = await ajax.get<any>(
      `/resources/${id}/file`,
      {},
      {
        responseType: 'arraybuffer',
      },
    )
    return Buffer.from(resp, 'binary')
  }
}

export const resourceApi = new ResourceApi();
