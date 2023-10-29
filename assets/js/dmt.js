$(document).ready(function () {
    // Load navbar
    $("#navbar").load("assets/components/navbar.html");

    $.getJSON('dmt_data.json', function (data) {
        let previousDMTDate = null;
        let minDaysSince = null;
        let maxDaysSince = null;
        let daysSinceArray = [];
        let lastDMTDate = null;

        $.each(data, function (index, item) {
            // Convert item date and year to a Date object
            const itemDateParts = item.date.split(" ");
            const itemMonth = getMonthNumber(itemDateParts[1]);
            const currentDMTDate = new Date(item.year, itemMonth, parseInt(itemDateParts[0]));
            lastDMTDate = currentDMTDate;

            // Calculate days since the last DMT
            let daysSince = "";
            if (previousDMTDate) {
                daysSince = Math.floor((currentDMTDate - previousDMTDate) / (1000 * 60 * 60 * 24));

                minDaysSince = minDaysSince ? Math.min(minDaysSince, daysSince) : daysSince;
                maxDaysSince = maxDaysSince ? Math.max(maxDaysSince, daysSince) : daysSince;
                daysSinceArray.push(daysSince);
            } else {
                daysSince = "N/A";  // Default value for the first recorded DMT
            }

            // Append to the table
            let row = `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.type}</td>
                    <td>${daysSince}</td>
                </tr>
            `;
            $(`#${item.year}-table`).prepend(row);

            // Set the current DMT date as the previous DMT date for the next iteration
            previousDMTDate = currentDMTDate;
        });

        $('#average-interval').text(Math.round(math.mean(daysSinceArray)));
        $('#median-interval').text(Math.round(math.median(daysSinceArray)));
        $('#range-interval').text(`${minDaysSince} - ${maxDaysSince}`);

        // Use this instead of lastDMTDate because lastDMTDate is in the format we want to display
        const lastRecordInJsonFile = data[data.length - 1];
        $('#last-dmt-date').text(lastRecordInJsonFile['date'] + " " + lastRecordInJsonFile['year']);

        const today = new Date();
        const daysSinceLastDMT = Math.floor((today - lastDMTDate) / (1000 * 60 * 60 * 24));
        $('#days-since-last-dmt').text(daysSinceLastDMT);
    });

    // Helper function to convert month name to month number
    function getMonthNumber(monthName) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(monthName);
    }
});