// ==UserScript==
// @name     Remove unwanted courses from schedule
// @author   Nicklas Breum
// @version  1
// @grant    GM.setValue
// @grant    GM.getValue
// @include  https://*/calmoodle/public/?sid=*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js 
// ==/UserScript==

$(document).ready(function () {

    getScheduleId = function () {
        var currentUrl = window.location.href;
        var urlObj = new URL(currentUrl);
        var scheduleId = urlObj.searchParams.get("sid");
        return scheduleId;
    };

    var SCHEDULE_ID = "courseFilter" + getScheduleId();

    filterCourse = function (courseName) {
        $(".event").each(function () {
            var eventName = $($(this).html()).html();
            if (eventName === courseName) {
                $(this).hide();
            }
        });
    };

    unfilterCourse = function (courseName) {
        $(".event").each(function () {
            var eventName = $($(this).html()).html();
            if (eventName === courseName) {
                $(this).show();
            }
        });
    };

    saveCourse = function (courseName) {
        GM.getValue(SCHEDULE_ID, "[]").then(function (value) {
            var courses = [];
            try {
                courses = JSON.parse(value);
            } catch (e) { }
            courses.push(courseName);
            GM.setValue(SCHEDULE_ID, JSON.stringify(courses));
        });
    };

    removeCourse = function (courseName) {
        GM.getValue(SCHEDULE_ID, "[]").then(function (value) {
            var courses = JSON.parse(value);
            courses = courses.filter(function (item) {
                return item !== courseName;
            });
            GM.setValue(SCHEDULE_ID, JSON.stringify(courses));
        });
    };

    $("body").prepend("<div id='eventFilter'></div>");

    $('#kursustable tr').each(function (index, el) {
        var courses = $('#kursustable td:nth-child(2)').map(function (index, el) {
            return $(el).text();
        });
        if (index === 0) {
            return;
        }
        $(this).append("<input class='chkboxEvent' type='checkbox' value='" + courses[index - 1] + "'>");
    });

    $(".chkboxEvent").change(function () {
        if (this.checked) {
            filterCourse($(this).val());
            saveCourse($(this).val());
        } else {
            unfilterCourse($(this).val());
            removeCourse($(this).val());
        }
    });

    loadSavedCourses = function () {
        GM.getValue(SCHEDULE_ID).then(function (value) {
            var courses = JSON.parse(value);
            $(".chkboxEvent").each(function (index, el) {
                if (courses.includes($(el).val())) {
                    $(el).prop("checked", true).change();
                }
            });
        });
    };

    loadSavedCourses();
});
