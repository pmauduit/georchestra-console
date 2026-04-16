(function () {
  // The backend stores selected areas as a comma-separated string in a hidden input.
  const parseCsv = (value) => (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  class AreaSelector {
    constructor(root) {
      this.root = root;
      this.hiddenInput = root.querySelector("input[type='hidden']");
      this.searchInput = root.querySelector(".js-area-search");
      this.groupSelect = root.querySelector(".js-area-group");
      this.sortSelect = root.querySelector(".js-area-sort");
      this.availableList = root.querySelector(".js-area-available-list");
      this.selectedList = root.querySelector(".js-area-selected-list");
      this.availableCount = root.querySelector(".js-area-available-count");
      this.selectedCount = root.querySelector(".js-area-selected-count");
      this.errorBox = root.querySelector(".js-area-error");
      this.liveRegion = root.querySelector(".js-area-live");
      this.mapElement = root.querySelector(".js-area-map");
      this.mapEmpty = root.querySelector(".js-area-map-empty");
      this.mapTooltip = root.querySelector(".js-area-map-tooltip");
      this.initialIds = parseCsv(this.hiddenInput?.value);
      this.selectedIds = new Set(this.initialIds);
      this.features = [];
      this.featuresById = new Map();
      this.map = null;
      this.vectorSource = null;
      this.vectorLayer = null;
      this.mapReady = false;
      this.hasFittedMap = false;
      this.resizeObserver = null;
    }

    async init() {
      if (!this.hiddenInput) {
        return;
      }

      this.bindEvents();

      try {
        // Load both the GeoJSON data and the metadata describing which properties
        // should be used as feature id, label and grouping values.
        const [configResponse, geoJsonResponse] = await Promise.all([
          fetch(this.root.dataset.configUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } }),
          fetch(this.root.dataset.geojsonUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        ]);

        if (!configResponse.ok) {
          throw new Error(this.root.dataset.loadError || "Unable to load areas.");
        }

        if (!geoJsonResponse.ok) {
          if (geoJsonResponse.status === 404) {
            throw new Error(
              this.root.dataset.missingAreasMessage
              || this.root.dataset.loadError
              || "Unable to load areas."
            );
          }
          throw new Error(this.root.dataset.loadError || "Unable to load areas.");
        }

        const config = await configResponse.json();
        const geojson = await geoJsonResponse.json();
        const keyProperty = config?.areas?.key;
        const valueProperty = config?.areas?.value;
        const groupProperty = config?.areas?.group;

        // Normalize every feature once so list rendering, filtering and tooltip
        // generation all work from the same in-memory representation.
        this.features = (geojson.features || [])
          .map((feature) => this.normalizeFeature(feature, keyProperty, valueProperty, groupProperty))
          .filter((feature) => feature !== null);

        this.features.forEach((feature) => {
          this.featuresById.set(feature.id, feature);
        });

        this.selectedIds = new Set([...this.selectedIds].filter((id) => this.featuresById.has(id)));
        this.populateGroups();
        this.initializeMap(geojson, keyProperty);
        this.syncHiddenInput();
        this.render();
      } catch (error) {
        this.showError(error.message || this.root.dataset.loadError || "Unable to load areas.");
      }
    }

    bindEvents() {
      this.searchInput?.addEventListener("input", () => this.render());
      this.groupSelect?.addEventListener("change", () => this.render());
      this.sortSelect?.addEventListener("change", () => this.render());

      this.root.querySelector(".js-area-add-all")?.addEventListener("click", () => {
        let addedCount = 0;
        this.features.forEach((feature) => {
          if (!this.selectedIds.has(feature.id)) {
            this.selectedIds.add(feature.id);
            addedCount += 1;
          }
        });
        this.syncHiddenInput();
        this.render();
        if (addedCount > 0) {
          this.announce(this.root.dataset.liveAddedAll || "All areas added.");
        }
      });

      this.root.querySelector(".js-area-clear")?.addEventListener("click", () => {
        this.selectedIds.clear();
        this.syncHiddenInput();
        this.render();
        this.announce(this.root.dataset.liveCleared || "Selection cleared.");
      });

      this.root.querySelector(".js-area-export")?.addEventListener("click", () => {
        const csv = [...this.selectedIds].join("\n");
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        link.download = "areas.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      this.root.querySelector(".js-area-import")?.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv,text/csv";
        input.addEventListener("change", async () => {
          const [file] = input.files || [];
          if (!file) {
            return;
          }
          const content = await file.text();
          let addedCount = 0;
          content.replace(/\r/g, "")
            .split("\n")
            .map((line) => line.split(/,|;/)[0].trim())
            .filter((id) => this.featuresById.has(id))
            .forEach((id) => {
              if (!this.selectedIds.has(id)) {
                this.selectedIds.add(id);
                addedCount += 1;
              }
            });
          this.syncHiddenInput();
          this.render();
          if (addedCount > 0) {
            this.announce(this.root.dataset.liveAddedAll || "All areas added.");
          }
        });
        input.click();
      });
    }

    normalizeFeature(feature, keyProperty, valueProperty, groupProperty) {
      const properties = feature.properties || {};
      const idValue = properties[keyProperty];
      if (idValue === undefined || idValue === null) {
        return null;
      }

      // Keep a compact metadata object for list UI and form submission. The full
      // OpenLayers feature remains in the vector source for map interaction.
      return {
        id: String(idValue),
        label: String(properties[valueProperty] ?? idValue),
        group: String(properties[groupProperty] ?? "")
      };
    }

    getTextComparator(mode) {
      if (mode === "id") {
        return (left, right) => left.id.localeCompare(right.id, undefined, { numeric: true });
      }
      if (mode === "group") {
        return (left, right) => {
          const groupCompare = left.group.localeCompare(right.group, undefined, { numeric: true });
          if (groupCompare !== 0) {
            return groupCompare;
          }
          const labelCompare = left.label.localeCompare(right.label, undefined, { numeric: true });
          if (labelCompare !== 0) {
            return labelCompare;
          }
          return left.id.localeCompare(right.id, undefined, { numeric: true });
        };
      }
      return (left, right) => {
        const labelCompare = left.label.localeCompare(right.label, undefined, { numeric: true });
        if (labelCompare !== 0) {
          return labelCompare;
        }
        return left.id.localeCompare(right.id, undefined, { numeric: true });
      };
    }

    sortFeatures(features) {
      const mode = this.sortSelect?.value || "label";
      return [...features].sort(this.getTextComparator(mode));
    }

    getSearchHaystack(feature) {
      return `${feature.id} ${feature.label} ${feature.group}`.toLowerCase();
    }

    formatFeatureTitle(feature) {
      const separator = this.root.dataset.listSeparator || " - ";
      return `${feature.id}${separator}${feature.label}`;
    }

    populateGroups() {
      if (!this.groupSelect) {
        return;
      }
      const groups = [...new Set(
        this.features
          .map((feature) => feature.group)
          .filter((group) => group.length > 0)
      )].sort((left, right) => left.localeCompare(right));

      groups.forEach((group) => {
        const option = document.createElement("option");
        option.value = group;
        option.textContent = group;
        this.groupSelect.appendChild(option);
      });
    }

    initializeMap(geojson, keyProperty) {
      if (!this.mapElement || !window.ol) {
        return;
      }

      // Read the GeoJSON in map projection and copy the configured business id to
      // the OpenLayers feature id so map clicks can resolve back to list entries.
      const format = new window.ol.format.GeoJSON();
      const features = format.readFeatures(geojson, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });

      features.forEach((feature) => {
        const idValue = feature.get(keyProperty);
        if (idValue !== undefined && idValue !== null) {
          feature.setId(String(idValue));
        }
      });

      if (features.length === 0) {
        this.mapElement.hidden = true;
        if (this.mapEmpty) {
          this.mapEmpty.hidden = false;
        }
        return;
      }

      this.vectorSource = new window.ol.source.Vector({ features });
      this.vectorLayer = new window.ol.layer.Vector({
        source: this.vectorSource,
        style: (feature) => this.buildFeatureStyle(feature)
      });

      this.map = new window.ol.Map({
        target: this.mapElement,
        controls: [],
        interactions: window.ol.interaction.defaults.defaults({
          altShiftDragRotate: false,
          pinchRotate: false
        }),
        layers: [
          new window.ol.layer.Tile({
            source: new window.ol.source.OSM()
          }),
          this.vectorLayer
        ],
        view: new window.ol.View({
          center: window.ol.proj.fromLonLat([1.77, 47.3]),
          zoom: 6
        })
      });

      this.map.on("singleclick", (event) => {
        let handled = false;
        this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
          handled = true;
          this.toggleSelection(String(feature.getId()));
          return true;
        });
        return handled;
      });

      this.map.on("pointermove", (event) => {
        if (event.dragging) {
          this.hideTooltip();
          return;
        }
        const feature = this.map.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
        if (!feature) {
          this.hideTooltip();
          return;
        }
        this.showTooltip(feature, event.pixel);
      });

      this.map.getViewport().addEventListener("mouseleave", () => {
        this.hideTooltip();
      });

      this.mapReady = true;
      this.mapElement.hidden = false;
      if (this.mapEmpty) {
        this.mapEmpty.hidden = true;
      }
      this.scheduleFitToExtent();
      this.installResizeObserver();
    }

    scheduleFitToExtent() {
      if (!this.map || !this.vectorSource) {
        return;
      }
      window.requestAnimationFrame(() => {
        this.fitMapToExtent();
      });
    }

    installResizeObserver() {
      if (!this.mapElement || typeof window.ResizeObserver === "undefined") {
        this.scheduleFitToExtent();
        return;
      }
      this.resizeObserver = new window.ResizeObserver(() => {
        if (!this.map) {
          return;
        }
        this.map.updateSize();
        if (!this.hasFittedMap && this.mapElement.clientWidth > 0 && this.mapElement.clientHeight > 0) {
          this.fitMapToExtent();
        }
      });
      this.resizeObserver.observe(this.mapElement);
    }

    fitMapToExtent() {
      if (!this.map || !this.vectorSource || !this.mapElement) {
        return;
      }

      const width = this.mapElement.clientWidth;
      const height = this.mapElement.clientHeight;
      if (width <= 0 || height <= 0) {
        return;
      }

      this.map.updateSize();
      const extent = this.vectorSource.getExtent();
      if (!extent || !extent.every((value) => Number.isFinite(value))) {
        return;
      }

      // Fit only after the map has a real rendered size, otherwise OpenLayers can
      // compute an incorrect viewport on initially hidden or not-yet-laid-out DOM.
      this.map.getView().fit(extent, {
        size: [width, height],
        padding: [24, 24, 24, 24],
        maxZoom: 12
      });
      this.hasFittedMap = true;
    }

    buildFeatureStyle(feature) {
      const featureId = String(feature.getId());
      const isSelected = this.selectedIds.has(featureId);
      const isAvailable = this.isFeatureAvailable(featureId);

      let fillColor = "rgba(0, 122, 128, 0.18)";
      let strokeColor = "rgba(0, 122, 128, 0.55)";

      if (isSelected) {
        fillColor = "rgba(22, 93, 141, 0.32)";
        strokeColor = "rgba(22, 93, 141, 1)";
      } else if (!isAvailable) {
        fillColor = "rgba(220, 225, 231, 0.3)";
        strokeColor = "rgba(149, 157, 165, 0.45)";
      }

      return new window.ol.style.Style({
        fill: new window.ol.style.Fill({ color: fillColor }),
        stroke: new window.ol.style.Stroke({ color: strokeColor, width: isSelected ? 2.2 : 1.2 })
      });
    }

    showTooltip(feature, pixel) {
      if (!this.mapTooltip) {
        return;
      }
      const featureId = String(feature.getId());
      const metadata = this.featuresById.get(featureId);
      if (!metadata) {
        this.hideTooltip();
        return;
      }
      const separator = this.root.dataset.tooltipSeparator || " - ";
      this.mapTooltip.textContent = `${featureId}${separator}${metadata.label}`;
      this.mapTooltip.hidden = false;
      this.mapTooltip.style.left = `${pixel[0]}px`;
      this.mapTooltip.style.top = `${pixel[1]}px`;
    }

    hideTooltip() {
      if (!this.mapTooltip) {
        return;
      }
      this.mapTooltip.hidden = true;
      this.mapTooltip.textContent = "";
    }

    isFeatureAvailable(featureId) {
      const feature = this.featuresById.get(featureId);
      if (!feature) {
        return false;
      }
      if (this.selectedIds.has(featureId)) {
        return true;
      }

      const searchTokens = (this.searchInput?.value || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 0);
      const selectedGroup = this.groupSelect?.value || "";

      if (selectedGroup && feature.group !== selectedGroup) {
        return false;
      }
      if (searchTokens.length === 0) {
        return true;
      }
      const haystack = this.getSearchHaystack(feature);
      return searchTokens.every((token) => haystack.includes(token));
    }

    toggleSelection(featureId) {
      if (this.selectedIds.has(featureId)) {
        this.selectedIds.delete(featureId);
        this.syncHiddenInput();
        this.render();
        this.announce(this.root.dataset.liveRemovedOne || "Area removed.");
        return;
      }

      this.selectedIds.add(featureId);
      this.syncHiddenInput();
      this.render();
      this.announce(this.root.dataset.liveAddedOne || "Area added.");
    }

    getFilteredAvailableFeatures() {
      const searchTokens = (this.searchInput?.value || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 0);
      const selectedGroup = this.groupSelect?.value || "";

      const filtered = this.features.filter((feature) => {
        if (this.selectedIds.has(feature.id)) {
          return false;
        }
        if (selectedGroup && feature.group !== selectedGroup) {
          return false;
        }
        if (searchTokens.length === 0) {
          return true;
        }
        const haystack = this.getSearchHaystack(feature);
        return searchTokens.every((token) => haystack.includes(token));
      });
      return this.sortFeatures(filtered);
    }

    getSelectedFeatures() {
      return this.sortFeatures([...this.selectedIds]
        .map((id) => this.featuresById.get(id))
        .filter((feature) => feature !== undefined));
    }

    render() {
      // Rebuild both lists from the current filters and selection state, then
      // refresh the map style so visual highlighting stays in sync.
      const availableFeatures = this.getFilteredAvailableFeatures();
      const selectedFeatures = this.getSelectedFeatures();

      this.renderList(this.availableList, availableFeatures, this.root.dataset.emptyAvailable, this.root.dataset.addLabel, "+", (featureId) => {
        this.selectedIds.add(featureId);
        this.syncHiddenInput();
        this.render();
        this.announce(this.root.dataset.liveAddedOne || "Area added.");
      });

      this.renderList(this.selectedList, selectedFeatures, this.root.dataset.emptySelected, this.root.dataset.removeLabel, "\u00d7", (featureId) => {
        this.selectedIds.delete(featureId);
        this.syncHiddenInput();
        this.render();
        this.announce(this.root.dataset.liveRemovedOne || "Area removed.");
      });

      if (this.vectorLayer) {
        this.vectorLayer.changed();
      }

      if (this.availableCount) {
        this.availableCount.textContent = String(availableFeatures.length);
        this.availableCount.setAttribute(
          "aria-label",
          (this.root.dataset.liveAvailableCount || "{0} available areas.").replace("{0}", String(availableFeatures.length))
        );
      }
      if (this.selectedCount) {
        this.selectedCount.textContent = String(selectedFeatures.length);
        this.selectedCount.setAttribute(
          "aria-label",
          (this.root.dataset.liveSelectedCount || "{0} selected areas.").replace("{0}", String(selectedFeatures.length))
        );
      }
    }

    renderList(target, features, emptyMessage, actionLabel, actionSymbol, action) {
      if (!target) {
        return;
      }
      target.innerHTML = "";

      if (features.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "area-selector-empty";
        emptyItem.textContent = emptyMessage || "";
        target.appendChild(emptyItem);
        return;
      }

      features.forEach((feature) => {
        const item = document.createElement("li");
        item.className = "area-selector-item";

        const meta = document.createElement("div");
        meta.className = "area-selector-meta";

        const title = document.createElement("strong");
        title.textContent = this.formatFeatureTitle(feature);
        meta.appendChild(title);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "button button-link area-selector-action-button";
        button.setAttribute("aria-label", actionLabel || "");
        button.title = actionLabel || "";
        button.textContent = actionSymbol || "";
        button.addEventListener("click", () => action(feature.id));

        item.appendChild(meta);
        item.appendChild(button);
        target.appendChild(item);
      });
    }

    syncHiddenInput() {
      if (this.hiddenInput) {
        // Keep the server-facing field aligned with the current UI selection.
        this.hiddenInput.value = [...this.selectedIds].join(",");
      }
    }

    showError(message) {
      if (!this.errorBox) {
        return;
      }
      this.errorBox.hidden = false;
      this.errorBox.textContent = message;
      this.announce(message);
    }

    announce(message) {
      if (!this.liveRegion || !message) {
        return;
      }
      this.liveRegion.textContent = "";
      window.setTimeout(() => {
        this.liveRegion.textContent = message;
      }, 10);
    }
  }

  window.ConsoleAreaSelector = {
    initAll() {
      // Multiple selectors can exist on the same page, so initialize them
      // independently from the shared fragment markup.
      document.querySelectorAll(".area-selector").forEach((root) => {
        const selector = new AreaSelector(root);
        selector.init();
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.ConsoleAreaSelector.initAll();
  });
}());
