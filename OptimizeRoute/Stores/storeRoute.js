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


module.exports = router;
