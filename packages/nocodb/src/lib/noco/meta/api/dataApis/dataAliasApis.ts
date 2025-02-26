import { Request, Response, Router } from 'express';
import Model from '../../../../noco-models/Model';
import { nocoExecute } from 'nc-help';
import Base from '../../../../noco-models/Base';
import NcConnectionMgrv2 from '../../../common/NcConnectionMgrv2';
import { PagedResponseImpl } from '../../helpers/PagedResponse';
import View from '../../../../noco-models/View';
import ncMetaAclMw from '../../helpers/ncMetaAclMw';
import { getViewAndModelFromRequestByAliasOrId } from './helpers';

async function dataList(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequestByAliasOrId(req);
  res.json(await getDataList(model, view, req));
}

async function dataInsert(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequestByAliasOrId(req);

  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(await baseModel.insert(req.body, null, req));
}

async function dataUpdate(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequestByAliasOrId(req);
  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(await baseModel.updateByPk(req.params.rowId, req.body, null, req));
}

async function dataDelete(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequestByAliasOrId(req);
  const base = await Base.get(model.base_id);
  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(await baseModel.delByPk(req.params.rowId, null, req));
}
async function getDataList(model, view: View, req) {
  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const requestObj = await baseModel.defaultResolverReq(req.query);

  const listArgs: any = { ...req.query };
  try {
    listArgs.filterArr = JSON.parse(listArgs.filterArrJson);
  } catch (e) {}
  try {
    listArgs.sortArr = JSON.parse(listArgs.sortArrJson);
  } catch (e) {}

  const data = await nocoExecute(
    requestObj,
    await baseModel.list(listArgs),
    {},
    listArgs
  );

  const count = await baseModel.count(listArgs);

  return new PagedResponseImpl(data, {
    ...req.query,
    count
  });
}

async function dataRead(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequestByAliasOrId(req);

  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(
    await nocoExecute(
      await baseModel.defaultResolverReq(),
      await baseModel.readByPk(req.params.rowId),
      {},
      {}
    )
  );
}

const router = Router({ mergeParams: true });

// table data crud apis
router.get(
  '/api/v1/db/data/:orgs/:projectName/:tableName',
  ncMetaAclMw(dataList, 'dataList')
);
router.get(
  '/api/v1/db/data/:orgs/:projectName/:tableName/:rowId',
  ncMetaAclMw(dataRead, 'dataRead')
);
router.patch(
  '/api/v1/db/data/:orgs/:projectName/:tableName/:rowId',
  ncMetaAclMw(dataUpdate, 'dataUpdate')
);
router.patch(
  '/api/v1/db/data/:orgs/:projectName/:tableName/:rowId',
  ncMetaAclMw(dataUpdate, 'dataUpdate')
);

router.get(
  '/api/v1/db/data/:orgs/:projectName/:tableName',
  ncMetaAclMw(dataList, 'dataList')
);

// table view data crud apis
router.get(
  '/api/v1/db/data/:orgs/:projectName/:tableName/views/:viewName',
  ncMetaAclMw(dataList, 'dataList')
);

router.post(
  '/api/v1/db/data/:orgs/:projectName/:tableName',
  ncMetaAclMw(dataInsert, 'dataInsert')
);
router.post(
  '/api/v1/db/data/:orgs/:projectName/:tableName/views/:viewName',
  ncMetaAclMw(dataInsert, 'dataInsert')
);
router.patch(
  '/api/v1/db/data/:orgs/:projectName/:tableName/views/:viewName/:rowId',
  ncMetaAclMw(dataUpdate, 'dataUpdate')
);
router.get(
  '/api/v1/db/data/:orgs/:projectName/:tableName/views/:viewName/:rowId',
  ncMetaAclMw(dataRead, 'dataRead')
);
router.delete(
  '/api/v1/db/data/:orgs/:projectName/:tableName/views/:viewName/:rowId',
  ncMetaAclMw(dataDelete, 'dataDelete')
);

export default router;
