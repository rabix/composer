"use strict";
const settings = require("electron-settings");
const defaults = {
    /**
     * Array of objects
     */
    credentials: [
        {
            label: "Seven Bridges",
            profile: "default",
            url: "https://igor.sbgenomics.com",
            sessionID: null,
            token: "",
        }
    ],
    lastScanTime: 0,
    selectedAppPanel: "my-apps",
    publicAppsGrouping: "toolkit",
    /**
     * Which of your folders are expanded
     * @type string[] tree node ids
     */
    expandedNodes: [],
    localFolders: [],
    dataCache: undefined,
    localAppsIndex: [],
};
function boot() {
    settings.defaults(defaults);
    return settings.applyDefaults();
}
exports.boot = boot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91c2VyLXByb2ZpbGUvcHJvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOENBQThDO0FBVTlDLE1BQU0sUUFBUSxHQUFHO0lBQ2I7O09BRUc7SUFDSCxXQUFXLEVBQUU7UUFDVDtZQUNJLEtBQUssRUFBRSxlQUFlO1lBQ3RCLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLEdBQUcsRUFBRSw2QkFBNkI7WUFDbEMsU0FBUyxFQUFFLElBQUk7WUFDZixLQUFLLEVBQUUsRUFBRTtTQUNjO0tBQ1I7SUFFdkIsWUFBWSxFQUFFLENBQUM7SUFDZixnQkFBZ0IsRUFBRSxTQUFTO0lBQzNCLGtCQUFrQixFQUFFLFNBQVM7SUFFN0I7OztPQUdHO0lBQ0gsYUFBYSxFQUFFLEVBQUU7SUFDakIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsY0FBYyxFQUFFLEVBQUU7Q0FDckIsQ0FBQztBQUVGO0lBQ0ksUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFIRCxvQkFHQyJ9