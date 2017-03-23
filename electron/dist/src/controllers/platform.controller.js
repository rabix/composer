"use strict";
function fetchApp(profile, id, callback) {
    this.settings.get("credentials").then(credentials => {
        const requestedPlatform = credentials.find(c => c.profile === profile);
    }, err => {
        callback(err);
    });
}
exports.fetchApp = fetchApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9wbGF0Zm9ybS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxrQkFBeUIsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRO0lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXO1FBQzdDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsQ0FBQztJQUMzRSxDQUFDLEVBQUUsR0FBRztRQUNGLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFORCw0QkFNQyJ9