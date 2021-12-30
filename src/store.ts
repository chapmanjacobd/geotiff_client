import { reactive } from "vue";
import { API } from "./config";
import { ref, readonly } from "vue";

const appState = reactive({
  layers: [] as Layer[] | LayerCompute[],
});

const computeUrl = (someKeys, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();

  return `${API}/compute/${someKeys}/{z}/{x}/{y}.png?${queryString}`;
};

const computeQueryParams = (layer: LayerCompute, someKeys = "") => {
  if (layer.layerVars.length == 1) console.log("only one compute var");
  if (layer.layerVars.length > 5) console.log("probably more vars than terracotta wants");

  const expr_proto = layer.layerVars.map((v, i) => {
    return `getmask(masked_outside(v${i + 1}, ${v.filteredRange.min}, ${v.filteredRange.max}))`;
  });
  const expr = `setmask(v1, ${expr_proto.join(" | ")})`;

  const operandKeys = {};
  layer.layerVars.reduce((obj, v, i) => {
    return { ...obj, [v[`v${i + 1}`]]: v.dataset };
  }, operandKeys);
  console.log(operandKeys);

  return computeUrl(someKeys, {
    colormap: layer.colorScale,
    stretch_range: String([layer.stretchedRange.min, layer.stretchedRange.max]),
    expression: expr,
    ...operandKeys,
  });
};

const fetchRange = async (dataset) => {
  fetch(`${API}/metadata/${dataset}`).then((r) => {
    r.json().then((j) => {
      console.log(j);
      return j["range"];
    });
  });
};

const theme = ref("dark");

export function useThemeStore() {
  /*
<template>
  <div>theme: {{ theme }}</div>
  <button @click="toggle">Toggle</button>
</template>

<script setup>
import { useThemeStore } from './useThemeStore'

const { toggle, theme } = useThemeStore()
</script>
*/

  const toggle = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };

  return {
    theme: readonly(theme),
    toggle,
  };
}

// const loadDatasets = async () => {
//   let resp = await (await fetch(`${API}/datasets?limit=10000`)).json();
//   return resp.datasets as Dataset[];
// };

const LAYER_VARS = [
  "ookla_mobile_downloadkbps_2021q1",
  "ookla_mobile_latency_ms_2021q1",
  "ookla_mobile_tests_x_devices_div_4_2021q1",
  "ookla_wifi_downloadkbps_2021q1",
  "ookla_wifi_latency_ms_2021q1",
  "ookla_wifi_tests_x_devices_div_4_2021q1",
  "osm_abandoned_all",
  "osm_access_customers",
  "osm_access_delivery",
  "osm_access_exclusion_zone",
  "osm_access_license",
  "osm_access_no",
  "osm_access_permit",
  "osm_activity_all",
  "osm_adults_all",
  "osm_advertising_all",
  "osm_amenity_atm",
  "osm_amenity_bench",
  "osm_amenity_cafe",
  "osm_amenity_casino",
  "osm_amenity_cinema",
  "osm_amenity_dentist",
  "osm_amenity_police",
  "osm_amenity_shower",
  "osm_arts_centre",
  "osm_bar_brewery",
  "osm_barrier_all",
  "osm_bicycle_no",
  "osm_bicycle_parking",
  "osm_bicycle_permissive",
  "osm_bicycle_private",
  "osm_bicycle_rental",
  "osm_boat_rental",
  "osm_bridge_all",
  "osm_building_garage_or_shed",
  "osm_building_hospital",
  "osm_building_levels_10",
  "osm_building_levels_20",
  "osm_building_levels_30",
  "osm_building_office",
  "osm_building_residential",
  "osm_building_roof",
  "osm_building_school",
  "osm_building_university",
  "osm_building_yes",
  "osm_bunker_all",
  "osm_bus_stop",
  "osm_butcher_or_dairy",
  "osm_camping_all",
  "osm_caravan_site",
  "osm_castle",
  "osm_church_mosque",
  "osm_coffee_shop",
  "osm_construction",
  "osm_consulate_diplomatic",
  "osm_covered_all",
  "osm_covered_no",
  "osm_craft_blacksmith",
  "osm_craft_carpenter",
  "osm_craft_electrician",
  "osm_craft_glaziery",
  "osm_craft_hvac",
  "osm_craft_metal_construction",
  "osm_craft_plumber",
  "osm_craft_sawmill",
  "osm_craft_window_construction",
  "osm_crossing_all",
  "osm_cuisine_american",
  "osm_cuisine_arab",
  "osm_cuisine_asian",
  "osm_cuisine_barbecue",
  "osm_cuisine_brazilian",
  "osm_cuisine_breakfast",
  "osm_cuisine_burger",
  "osm_cuisine_cake",
  "osm_cuisine_chicken",
  "osm_cuisine_chinese",
  "osm_cuisine_ice_cream",
  "osm_cuisine_indian",
  "osm_cuisine_international_local",
  "osm_cuisine_italian",
  "osm_cuisine_japanese",
  "osm_cuisine_kebab",
  "osm_cuisine_korean",
  "osm_cuisine_mediterranean",
  "osm_cuisine_mexican",
  "osm_cuisine_noodle",
  "osm_cuisine_seafood",
  "osm_cuisine_spanish",
  "osm_cuisine_sushi",
  "osm_cuisine_texmex",
  "osm_cuisine_thai",
  "osm_cuisine_turkish",
  "osm_cuisine_vietnamese",
  "osm_delivery_no",
  "osm_delivery_takeaway",
  "osm_denotation_urban",
  "osm_dogshop_dogpark",
  "osm_drinking_water",
  "osm_drive_through",
  "osm_emergency_all",
  "osm_events_venue",
  "osm_fabric_shop",
  "osm_fast_food",
  "osm_fee_yes",
  "osm_female_only",
  "osm_ferry_terminal",
  "osm_firepit_bbq",
  "osm_food_court",
  "osm_foot_no",
  "osm_foot_permit",
  "osm_foot_private",
  "osm_free_wifi",
  "osm_gliding_all",
  "osm_harbour_oil_platform",
  "osm_harbour_yacht",
  "osm_hgv_no",
  "osm_highway_steps",
  "osm_hiking_footwaypath",
  "osm_historic_citygate_or_fort",
  "osm_historic_monument",
  "osm_historic_ruins",
  "osm_hotel_all",
  "osm_industrial_all",
  "osm_information_kiosk",
  "osm_internet_cafe",
  "osm_isolated_dwelling",
  "osm_junction_roundabout",
  "osm_kids_all",
  "osm_landuse_commercial",
  "osm_landuse_farm",
  "osm_landuse_forest",
  "osm_landuse_residential",
  "osm_landuse_retail",
  "osm_lanes_5to8",
  "osm_leisure_beach",
  "osm_leisure_bowling_alley",
  "osm_leisure_dancing",
  "osm_leisure_fishing",
  "osm_leisure_miniature_golf",
  "osm_leisure_outdoor",
  "osm_leisure_park",
  "osm_leisure_stadium",
  "osm_leisure_wildlife_hide",
  "osm_leisure_yes",
  "osm_library_bookshop",
  "osm_male_only",
  "osm_man_made",
  "osm_man_made_windmill",
  "osm_maxspeed_25",
  "osm_minspeed_90",
  "osm_motor_vehicle_designated",
  "osm_motor_vehicle_permit",
  "osm_motorcar_no",
  "osm_motorcycle_no",
  "osm_motorcycle_parking",
  "osm_motorway_junction",
  "osm_museum",
  "osm_narrow_yes",
  "osm_natural_bay",
  "osm_natural_cliff",
  "osm_natural_reef",
  "osm_natural_rock",
  "osm_natural_strait",
  "osm_natural_tree",
  "osm_natural_valley",
  "osm_natural_water",
  "osm_natural_wetland",
  "osm_natural_wood",
  "osm_no_drinking_water",
  "osm_no_sidewalk",
  "osm_office_architect",
  "osm_office_company",
  "osm_office_it",
  "osm_office_research",
  "osm_office_yes",
  "osm_opening_hours_24_7",
  "osm_opening_hours_sunrise_sunset",
  "osm_operator_community",
  "osm_parking_all",
  "osm_place_city",
  "osm_place_hamlet",
  "osm_place_island",
  "osm_place_islet",
  "osm_place_neighbourhood",
  "osm_place_quarter",
  "osm_place_square",
  "osm_place_suburb",
  "osm_place_town",
  "osm_place_village",
  "osm_power_supply",
  "osm_public_all",
  "osm_public_bath_bath_type",
  "osm_public_transport",
  "osm_railway_station",
  "osm_religion_buddhist",
  "osm_religion_christian",
  "osm_religion_hindu",
  "osm_religion_jewish",
  "osm_religion_muslim",
  "osm_reservation_required",
  "osm_reservation_yes",
  "osm_residential_all",
  "osm_residential_condominium",
  "osm_residential_gated",
  "osm_restaurant_pub",
  "osm_sad_all",
  "osm_sauna_natural_spring",
  "osm_seasonal_intermittent",
  "osm_shop_bakery",
  "osm_shop_beverages",
  "osm_shop_convenience",
  "osm_shop_deli",
  "osm_shop_dry_cleaning",
  "osm_shop_florist",
  "osm_shop_gas",
  "osm_shop_laundry",
  "osm_shop_mall",
  "osm_shop_massage",
  "osm_shop_outdoor",
  "osm_shop_paint",
  "osm_shop_pawnbroker",
  "osm_shop_secondhand_antiques",
  "osm_shop_tattoo",
  "osm_shop_travel_agency",
  "osm_shop_wine_or_winery",
  "osm_shop_yes",
  "osm_sidewalk_all",
  "osm_smoking_no",
  "osm_smoking_outside",
  "osm_smoking_yes",
  "osm_sport_10pin",
  "osm_sport_baseball",
  "osm_sport_basketball",
  "osm_sport_climbing",
  "osm_sport_cycling",
  "osm_sport_golf",
  "osm_sport_hockey",
  "osm_sport_horseriding",
  "osm_sport_motor_sport_or_paintball",
  "osm_sport_rugby",
  "osm_sport_shooting",
  "osm_sport_skatepark",
  "osm_sport_skiing",
  "osm_sport_soccer",
  "osm_sport_swimming",
  "osm_sport_table_tennis",
  "osm_sport_tennis",
  "osm_sport_volleyball",
  "osm_sports_centre",
  "osm_surface_grass",
  "osm_surface_paved",
  "osm_surface_paving_stones",
  "osm_surface_unpaved",
  "osm_swimming_pool",
  "osm_theme_park",
  "osm_toilets_access_customers",
  "osm_toilets_no",
  "osm_tourism_aquarium",
  "osm_tourism_viewpoint",
  "osm_tourism_yes",
  "osm_traffic_calming",
  "osm_train_all",
  "osm_vegetarian_all",
  "osm_vehicle_private",
  "osm_walkable_all",
  "osm_wheelchair_no",
  "transport_bus_money",
  "transport_bus_time",
  "transport_drive_money",
  "transport_drive_time",
  "transport_ferry_money",
  "transport_ferry_time",
  "transport_fly_money",
  "transport_fly_time",
  "transport_metro_money",
  "transport_metro_time",
  "transport_nighttrain_money",
  "transport_nighttrain_time",
  "transport_other_money",
  "transport_other_time",
  "transport_taxi_money",
  "transport_taxi_time",
  "transport_uber_money",
  "transport_uber_time",
];

const COLORSCALES = [
  "accent_r",
  "accent",
  "afmhot_r",
  "afmhot",
  "autumn_r",
  "autumn",
  "binary_r",
  "binary",
  "blues_r",
  "blues",
  "bone_r",
  "bone",
  "brbg_r",
  "brbg",
  "brg_r",
  "brg",
  "bugn_r",
  "bugn",
  "bupu_r",
  "bupu",
  "bwr_r",
  "bwr",
  "cividis_r",
  "cividis",
  "cloud",
  "cmrmap_r",
  "cmrmap",
  "cool_r",
  "cool",
  "coolwarm_r",
  "coolwarm",
  "copper_r",
  "copper",
  "cubehelix_r",
  "cubehelix",
  "dark2_r",
  "dark2",
  "flag_r",
  "flag",
  "gist_earth_r",
  "gist_earth",
  "gist_gray_r",
  "gist_gray",
  "gist_heat_r",
  "gist_heat",
  "gist_ncar_r",
  "gist_ncar",
  "gist_rainbow_r",
  "gist_rainbow",
  "gist_stern_r",
  "gist_stern",
  "gist_yarg_r",
  "gist_yarg",
  "gnbu_r",
  "gnbu",
  "gnuplot2_r",
  "gnuplot2",
  "gnuplot_r",
  "gnuplot",
  "gray_r",
  "gray",
  "greens_r",
  "greens",
  "greys_r",
  "greys",
  "hot_r",
  "hot",
  "hsv_r",
  "hsv",
  "inferno_r",
  "inferno",
  "jet_r",
  "jet",
  "magma_r",
  "magma",
  "nipy_spectral_r",
  "nipy_spectral",
  "ocean_r",
  "ocean",
  "oranges_r",
  "oranges",
  "orrd_r",
  "orrd",
  "paired_r",
  "paired",
  "pastel1_r",
  "pastel1",
  "pastel2_r",
  "pastel2",
  "pink_r",
  "pink",
  "piyg_r",
  "piyg",
  "plasma_r",
  "plasma",
  "prgn_r",
  "prgn",
  "prism_r",
  "prism",
  "pubu_r",
  "pubu",
  "pubugn_r",
  "pubugn",
  "puor_r",
  "puor",
  "purd_r",
  "purd",
  "purples_r",
  "purples",
  "rainbow_r",
  "rainbow",
  "rdbu_r",
  "rdbu",
  "rdgy_r",
  "rdgy",
  "rdpu_r",
  "rdpu",
  "rdylbu_r",
  "rdylbu",
  "rdylgn_r",
  "rdylgn",
  "reds_r",
  "reds",
  "seismic_r",
  "seismic",
  "set1_r",
  "set1",
  "set2_r",
  "set2",
  "set3_r",
  "set3",
  "spectral_r",
  "spectral",
  "spring_r",
  "spring",
  "summer_r",
  "summer",
  "tab10_r",
  "tab10",
  "tab20_r",
  "tab20",
  "tab20b_r",
  "tab20b",
  "tab20c_r",
  "tab20c",
  "terrain_r",
  "terrain",
  "twilight_r",
  "twilight",
  "twilight_shifted_r",
  "twilight_shifted",
  "viridis_r",
  "viridis",
  "winter_r",
  "winter",
  "wistia_r",
  "wistia",
  "ylgn_r",
  "ylgn",
  "ylgnbu_r",
  "ylgnbu",
  "ylorbr_r",
  "ylorbr",
  "ylorrd_r",
  "ylorrd",
];

export { appState, COLORSCALES, LAYER_VARS };
