window._mfrAlpineRegistered = window._mfrAlpineRegistered || {};

if (!window._mfrAlpineRegistered["MFRProductFilter"]) {
  document.addEventListener("alpine:init", () => {
    Alpine.store('gridData', {
      productData: window.productData,
      filtersData: []
    });

    Alpine.data("MFRProductFilter", (sectionID, increment) => ({
      activeCollection: null,
      itemsPerPage: 8,
      currentPage: 1,
      visibleIds: [],
      productData: [],
      increment: parseInt(increment),

      init() {
        if(!Alpine.store("gridData").productData) return;

        this.filterByCollection("all");
      },

      getProductOrder(id) {
        if(!Alpine.store("gridData").productData) return;
        const product = Alpine.store("gridData").productData.filter(item => item.id == id);
        return product[0].order || 0;
      },

      filterByCollection(handle) {
        handle = handle.toLowerCase();

        if(handle != 'all' && Alpine.store("gridData").filtersData.indexOf(handle) < 0) {
          Alpine.store("gridData").filtersData.push(handle);
          Alpine.store("gridData").filtersData = Alpine.store("gridData").filtersData.filter(item => item !== "all");
        } else if(handle == 'all') {
          Alpine.store("gridData").filtersData = ["all"];
        }

        this.updateProductData();
      },

      updateProductData() {
        let count = increment;
        if(!Alpine.store("gridData").productData) return;

        Alpine.store("gridData").productData.forEach((item, index) => {
          const className = item.className.toLowerCase();

          item.isCategoryShow = Alpine.store("gridData").filtersData.some(filter =>
            className.includes(`filter--${filter.toLowerCase()}`)
          );

          if(!item.isCategoryShow || !item.isFilterShow) return;

          if(count > 0) {
            item.isLoadMoreShow = true;
            count--;
          } else {
            item.isLoadMoreShow = false;
          }
        });
      },

      removeFilter(handle) {
        const index = Alpine.store("gridData").filtersData.indexOf(handle);

        if(index > -1) {
          Alpine.store("gridData").filtersData.splice(index, 1);
        }

        if(Alpine.store("gridData").filtersData.length == 0) {
          this.filterByCollection("all");
        }

        this.updateProductData();
      },

      checkUnloadedItems() {
        if(!Alpine.store("gridData").productData) return;

        const unloadedItems = Alpine.store("gridData").productData.filter((item) => {
          return item.isCategoryShow && item.isFilterShow && !item.isLoadMoreShow;
        });

        return unloadedItems.length > 0;
      },

      loadMoreItems(increment) {
        if(!Alpine.store("gridData").productData) return;
        if(!increment) return;

        const itemsToShow = Alpine.store("gridData").productData.filter((item) => {
          return item.isCategoryShow && item.isFilterShow && !item.isLoadMoreShow;
        });

        if(itemsToShow.length > 0) {
          for(let i = 0; i < increment; i++) {
            if(itemsToShow[i]) {
              itemsToShow[i].isLoadMoreShow = true;
            }
          }
        }
      },

      shouldShow(id) {
        if (!Alpine.store('gridData').productData) return true;

        const product = Alpine.store('gridData').productData.find(p => parseInt(p.id) === parseInt(id));
        if (!product) return false;

        const bool = product.isCategoryShow && product.isFilterShow && product.isLoadMoreShow;

        return bool;
      }
    }));
  });

  window._mfrAlpineRegistered["MFRProductFilter"] = true;
}
