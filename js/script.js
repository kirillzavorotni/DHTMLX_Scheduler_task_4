// config
const scheduler = Scheduler.getSchedulerInstance();
scheduler.config.multi_day = true;
scheduler.config.hour_size_px = 88;

var room_opts = scheduler.serverList("rooms", [
	{ key: 1, label: "412" },
	{ key: 2, label: "401" },
	{ key: 3, label: "406" },
	{ key: 4, label: "408" },
	{ key: 5, label: "412" },
	{ key: 6, label: "505" },
	{ key: 7, label: "512" },
]);

var owner_opts = scheduler.serverList("owners", [
	{ key: 1, label: "Alex Brown", color: "#F09898" },
	{ key: 2, label: "Dan Abramov", color: "#D881CE" },
	{ key: 3, label: "Vlad Mamedov", color: "#C085D8" },
	{ key: 4, label: "Kiryl Zavarotny", color: "#8590D8" },
	{ key: 5, label: "Dmitry Voitenhovich", color: "#85D8C0" },
	{ key: 6, label: "Vadim Makeev", color: "#AFD885" },
]);

// functions
function getOwnerConfig(ownersArray, event) {
	for (let i = 0, len = ownersArray.length; i < len; i++) {
		if (ownersArray[i]["key"] == event.owner_id) {
			return {
				ownerName: ownersArray[i]["label"],
				ownerColor: ownersArray[i]["color"],
			};
		}
	}
	return false;
}

function getRoomName(roomsArray, event) {
	for (let i = 0, len = roomsArray.length; i < len; i++) {
		if (roomsArray[i]["key"] == event.room_id) {
			return roomsArray[i]["label"];
		}
	}
	return false;
}

function renderMarker() {
	scheduler.deleteMarkedTimespan(markerId);
  markerId = scheduler.addMarkedTimespan({
   start_date: new Date(2005, 1, 1),
   end_date: new Date(),
   type: "dhx_time_block"
 });
 scheduler.updateView();
}

//************************************************************************************************//
// 1
// change header text in day tab
scheduler.templates.day_date = scheduler.date.date_to_str("%l, %j. %F %Y (week %W)*");
const week_date_start_format = scheduler.date.date_to_str("%l, %j. %F");

// change header text in week tab
scheduler.templates.week_date = function (start, end) {
	return week_date_start_format(start) + " &ndash; " +
		scheduler.templates.day_date(scheduler.date.add(end, -1, "day"));
};

// change time scale template
const timeScaleFullHourFormat = scheduler.date.date_to_str("%H:%i");
const timeScaleQuarterHourFormat = scheduler.date.date_to_str("%i");
const step = 15;
scheduler.templates.hour_scale = function (date) {
	let result_cell = "<div class='time-scale-wrap'>";

	for (let i = 0; i < (60 / step); i++) {
		if (i === 0) {
			result_cell += `<div class="time-scale-full-hour">${timeScaleFullHourFormat(date)}</div>`;
		} else {
			result_cell += `<div class="time-scale-quarter-hour">${timeScaleQuarterHourFormat(date)}</div>`;
		}
		date = scheduler.date.add(date, step, "minute");
	}

	result_cell += "</div>";
	return result_cell;
};
// 1
//************************************************************************************************//


//************************************************************************************************//
// 2
// add select room to lightbox
scheduler.locale.labels.section_select_room = 'Room';
// add select owner to lightbox
scheduler.locale.labels.section_select_owner = 'Owner';

scheduler.config.lightbox.sections = [
	{ name: "description", height: 100, map_to: "text", type: "textarea", focus: true },
	{ name: "Room", height: 25, options: scheduler.serverList("rooms"), map_to: "room_id", type: "select", vertical: false, default_value: "" },
	{ name: "Owner", height: 25, options: scheduler.serverList("owners"), map_to: "owner_id", type: "select", vertical: false, default_value: "" },
	{ name: "time", height: 72, type: "time", map_to: "auto" }
]


scheduler.attachEvent("onTemplatesReady", function () {
	scheduler.templates.event_header = function (start, end, event) {
		if (event.owner_id) {
			const ownerConfig = getOwnerConfig(owner_opts, event);
			event.color = ownerConfig.ownerColor;
			return scheduler.templates.event_date(start) + " - " +
				scheduler.templates.event_date(end) + ", " + ownerConfig.ownerName;
		}
		return scheduler.templates.event_date(start) + " - " +
			scheduler.templates.event_date(end);
	};

	scheduler.templates.event_text = function (start, end, event) {
		if (event.room_id) {
			return event.text + "<br> Room " + getRoomName(room_opts, event);
		}
		return event.text
	};
});
// 2
//************************************************************************************************//


//************************************************************************************************//
// 3
const evTooltipTimeformat = scheduler.date.date_to_str("%H:%i");
const evTooltipDayformat = scheduler.date.date_to_str("%l, %d. %F %Y");
scheduler.templates.tooltip_text = function (start, end, event) {
	// room and owner name exist
	if (event.owner_id && event.room_id) {
		const ownerConfig = getOwnerConfig(owner_opts, event);
		return `<b>Event:</b> ${event.text}<br>
			${evTooltipTimeformat(start)} - ${evTooltipTimeformat(end)}, ${evTooltipDayformat(start)}<br>
			${ownerConfig.ownerName}, ROOM ${getRoomName(room_opts, event)}
		`;
	}
	// only owner name exist
	if (event.owner_id) {
		const ownerConfig = getOwnerConfig(owner_opts, event);
		return `<b>Event:</b> ${event.text}<br>
			${evTooltipTimeformat(start)} - ${evTooltipTimeformat(end)}, ${evTooltipDayformat(start)}<br>
			${ownerConfig.ownerName}
		`;
	}
	// only room exist
	if (event.room_id) {
		return `<b>Event:</b> ${event.text}<br>
			${evTooltipTimeformat(start)} - ${evTooltipTimeformat(end)}, ${evTooltipDayformat(start)}<br>
			ROOM ${getRoomName(room_opts, event)}
		`;
	}
	// nothing exists
	return `
		<b>Event:</b> ${event.text}<br>
		${evTooltipTimeformat(start)} - ${evTooltipTimeformat(end)}, ${evTooltipDayformat(start)}<br>
	`;
};
// 3
//************************************************************************************************//


//************************************************************************************************//
// 4
scheduler.locale.labels.unit_tab = "Unit";
scheduler.locale.labels.timeline_tab = "Timeline";
scheduler.createUnitsView({
	name: "unit",
	property: "room_id",
	list: room_opts
});

scheduler.createTimelineView({
	name: "timeline",
	x_unit: "minute",
	x_date: "%H:%i",
	x_step: 15,
	x_size: 24,
	x_start: 0,
	y_unit: room_opts,
	y_property: "room_id",
	render: "bar",
	event_dy: 60
});
// 4
//************************************************************************************************//


//************************************************************************************************//
// 5
markerId = scheduler.addMarkedTimespan({
	start_date: new Date(2005, 1, 1),
	end_date: new Date(),
	css: "gray_section",
	type: "dhx_time_block"
});

setInterval(() => {
	renderMarker();
}, 120000);
// 5
//************************************************************************************************//

// init the scheduler
scheduler.init('scheduler_here', new Date(), "day");

// add test events
scheduler.addEvent({
	start_date: "14-04-2019 09:00",
	end_date: "14-04-2019 11:00",
	text: "Meeting",
	room_id: 3,
	owner_id: 3
});

scheduler.addEvent({
	start_date: "15-04-2019 16:00",
	end_date: "15-04-2019 19:00",
	text: "Meeting",
	room_id: 5,
	owner_id: 4
});