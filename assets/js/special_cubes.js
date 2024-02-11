$(document).ready(function () {
    // Load navbar
    $("#navbar").load("assets/components/navbar.html");

    $.getJSON('special_cubes_data.json', function (data) {
        $.each(data, function (key, val) {
            // Extract the year from the start date
            var startDate = new Date(val.start);
            var year = startDate.getFullYear();

            var newRow = $('<tr>');
            newRow.append($('<td>').text(val.cube));
            newRow.append($('<td>').text(val.start));
            newRow.append($('<td>').text(val.end));

            if (val.link && val.link.trim() !== "") {
                var linkElement = $('<a>', {
                    text: 'Link',
                    href: val.link,
                    target: '_blank'
                });

                newRow.append($('<td>').append(linkElement));
            } else {
                newRow.append($('<td>').text('No link'));
            }

            var tableId = '#' + year + '-table';
            $(tableId).prepend(newRow);
        });
    });
});
