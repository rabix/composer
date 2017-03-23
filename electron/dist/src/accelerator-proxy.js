const registry = {};
module.exports = {
    on: (accelerator, callback) => {
        registry[accelerator] = callback;
    },
    pass: (menu, browser, event) => {
        if (typeof registry[menu.accelerator] === "function") {
            registry[menu.accelerator](menu, browser, event);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZWxlcmF0b3ItcHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYWNjZWxlcmF0b3ItcHJveHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBRXBCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFFYixFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUTtRQUN0QixRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUs7UUFDdkIsRUFBRSxDQUFDLENBQUMsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUM7SUFDTCxDQUFDO0NBQ0osQ0FBQyJ9