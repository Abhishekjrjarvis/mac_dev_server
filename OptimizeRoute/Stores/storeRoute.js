const express = require("express");
const router = express.Router();
const Store = require("../../OptimizeController/Stores/storeController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

router.post(
  "/ins/:id/store/query",
  catchAsync(Store.render_new_store_query)
);

router.get(
  "/ins/:sid/master/query",
  catchAsync(Store.render_store_master_query)
);

router.post(
  "/:sid/new/good/category/query",
  catchAsync(Store.render_new_good_category_query)
);

router.get(
  "/:sid/all/good/category/query",
  catchAsync(Store.render_all_good_category_query)
);

router.get(
  "/:gcid/one/good/category/query",
  catchAsync(Store.render_one_good_category_query)
);

router.post(
  "/:gcid/new/goods/query",
  catchAsync(Store.render_new_goods_query)
);

router.get(
  "/:gcid/all/goods/query",
  catchAsync(Store.render_all_goods_query)
);

router.post(
  "/:sid/new/goods/head/person/query",
  catchAsync(Store.render_new_good_head_person_query)
);

router.get(
  "/:sid/goods/head/person/query",
  catchAsync(Store.render_all_good_head_person_query)
);

router.patch(
  "/:gcid/add/stock/query",
  catchAsync(Store.render_add_stock_query)
);

router.post(
  "/:sid/issue/stock/query",
  catchAsync(Store.render_issue_stock_query)
);

router.get(
  "/:sid/all/issue/stock/query",
  catchAsync(Store.render_all_issue_stock_query)
);


router.get(
  "/one/issue/:icid/stock/query",
  catchAsync(Store.render_one_issue_stock_query)
);

router.get(
  "/:sid/daybook/query",
  catchAsync(Store.render_daybook_stock_query)
);

router.get(
  "/:sid/category/all/goods/query",
  catchAsync(Store.render_category_all_goods_query)
);

router.get(
  "/:did/all/classes/query",
  catchAsync(Store.render_all_classes_query)
);

router.get(
  "/:sid/merge/custom/query",
  catchAsync(Store.render_merge_custom_query)
);

router.get(
  "/:mid/all/register/query",
  catchAsync(Store.render_module_all_register_query)
);

router.get(
  "/:mid/all/issue/query",
  catchAsync(Store.render_module_all_issue_query)
);

router.get(
  "/:mid/all/return/query",
  catchAsync(Store.render_module_all_return_query)
);

router.get(
  "/:mid/all/consume/query",
  catchAsync(Store.render_module_all_consume_query)
);

router.get(
  "/:mid/all/stocktake/query",
  catchAsync(Store.render_module_all_stocktake_query)
);

router.get(
  "/:mid/all/request/query",
  catchAsync(Store.render_module_all_request_query)
);

router.get(
  "/:mid/all/maintainence/query",
  catchAsync(Store.render_module_all_maintainence_query)
);


router.get(
  "/:gid/goods/all/register/query",
  catchAsync(Store.render_goods_all_register_query)
);

router.get(
  "/:gid/goods/all/issue/query",
  catchAsync(Store.render_goods_all_issue_query)
);

router.get(
  "/:gid/goods/all/return/query",
  catchAsync(Store.render_goods_all_return_query)
);

router.get(
  "/:gid/goods/all/consume/query",
  catchAsync(Store.render_goods_all_consume_query)
);

router.get(
  "/:gid/goods/all/stocktake/query",
  catchAsync(Store.render_goods_all_stocktake_query)
);

router.get(
  "/:gid/goods/all/request/query",
  catchAsync(Store.render_goods_all_request_query)
);

router.get(
  "/:gid/goods/all/maintainence/query",
  catchAsync(Store.render_goods_all_maintainence_query)
);

router.post(
  "/:sid/request/stock/query",
  catchAsync(Store.render_request_stock_query)
);

router.patch(
  "/:sid/mark/status/query",
  catchAsync(Store.render_mark_status_stock_query)
);

router.post(
  "/:sid/return/stock/query",
  catchAsync(Store.render_return_stock_query)
);

router.get(
  "/:sid/all/return/stock/query",
  catchAsync(Store.render_all_return_stock_query)
);

router.get(
  "/one/return/:icid/stock/query",
  catchAsync(Store.render_one_return_stock_query)
);

router.patch(
  "/:sid/qr/code/query",
  catchAsync(Store.goods_qr_generation)
);

router.get(
  "/:sid/all/request/stock/query",
  catchAsync(Store.render_all_request_stock_query)
);



module.exports = router;
