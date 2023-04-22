$(document).ready(function () {
    $("#sim-form").on('submit', function (e) {
        e.preventDefault();
    });

    var sim_equip_lvl = 200; // Default equipment level is 200
    var sim_starting_stars = 0;
    var sim_mvp_grade = "None";
    var sim_psc = "No";
    var sim_total_cost = 0;
    var sim_30_disc = false;
    var sim_51015 = false;
    var sim_no_boom = false;
    var sim_1_plus_1 = false;
    var sim_replacement_cost = 0;

    function initialize_sim() {
        $('#sim-current-stars').text(sim_starting_stars);

        $('#sim-next-stars').text(sim_starting_stars + 1);

        // Override (if 1+1)
        if (sim_1_plus_1 == true) {
            if (sim_starting_stars <= 10) {
                $("#sim-next-stars-strike").css("display", "inline-block");
                $("#sim-next-stars-strike-span").text(sim_starting_stars + 1);
                $('#sim-next-stars').text(sim_starting_stars + 2);
            }
        } else {
            $("#sim-next-stars-strike").css("display", "none");
        }

        $('#sim-cost').text(get_meso_cost(sim_equip_lvl, sim_starting_stars)[0].toLocaleString("en-US"));
        $('#sim-total-cost').text(sim_total_cost.toLocaleString("en-US"));

        res = get_probabilities(sim_starting_stars);

        update_sim_display(res, sim_starting_stars);
    }

    // Start simulator
    initialize_sim();

    var decrease_count = 0;

    $("#sim-apply-settings-btn").click(function () {
        // TRIVIAL CHECKS
        if (parseInt($("#sim-starting-stars").val()) < 0 || parseInt($("#sim-starting-stars").val()) > 24) {
            alert("Starting stars should be between 0 to 24!");
            return;
        }

        if ($("#sim-equip-lvl").val() < 0 || $("#sim-equip-lvl").val() > 250) {
            alert("Item level should be between 0 to 250!");
            return;
        }

        if (parseInt($("#sim-replacement-cost").val()) < 0) {
            alert("Invalid replacement cost!");
            return;
        }

        sim_equip_lvl = $("#sim-equip-lvl").val();
        sim_starting_stars = parseInt($("#sim-starting-stars").val());
        sim_mvp_grade = $("#sim-mvp-grade").val();
        sim_psc = $("#sim-psc").val();
        sim_replacement_cost = parseInt($("#sim-replacement-cost").val());
        sim_total_cost = 0;

        if ($("#cancel-star-catch").is(':checked')) {
            $("#cancel-star-catch").prop('checked', false); // Unchecks it
        }

        if ($("#anti-boom").is(':checked')) {
            $('#anti-boom').prop('checked', false); // Unchecks it
        }

        if ($("#sim-30-disc").is(':checked')) {
            sim_30_disc = true;
        } else {
            sim_30_disc = false;
        }

        if ($("#sim-51015").is(':checked')) {
            sim_51015 = true;
        } else {
            sim_51015 = false;
        }

        if ($("#sim-no-boom").is(':checked')) {
            sim_no_boom = true;
        } else {
            sim_no_boom = false;
        }

        if ($("#sim-1-plus-1").is(':checked')) {
            sim_1_plus_1 = true;
        } else {
            sim_1_plus_1 = false;
        }

        $("#sim-revive-btn").css("display", "none"); // Hide revive button
        $("#sim-enhance-btn").css("display", "block"); // Show enhance button

        $("#sim-destroyed-image").css("display", "none"); // Hide destroyed image

        decrease_count = 0; // Reinitialize decrease count to 0

        initialize_sim();
    });

    $("#sim-revive-btn").click(function () {
        sim_starting_stars = 12;

        if ($("#cancel-star-catch").is(':checked')) {
            $("#cancel-star-catch").prop('checked', false); // Unchecks it
        }

        if ($("#anti-boom").is(':checked')) {
            $('#anti-boom').prop('checked', false); // Unchecks it
        }

        $("#sim-revive-btn").css("display", "none"); // Hide revive button
        $("#sim-enhance-btn").css("display", "block"); // Show enhance button

        $("#sim-destroyed-image").css("display", "none"); // Hide destroyed image

        decrease_count = 0; // Reinitialize decrease count to 0

        sim_total_cost += sim_replacement_cost; // Add item replacement cost

        initialize_sim();
    });

    $('#anti-boom').change(function () {
        var current_stars = $('#sim-current-stars').text();
        let temp = get_meso_cost(sim_equip_lvl, current_stars);

        if ($("#anti-boom").is(':checked')) {
            $('#sim-cost').text(temp[1].toLocaleString("en-US"));
        }
        else {
            $('#sim-cost').text(temp[0].toLocaleString("en-US"));
        }
    });

    $("#sim-reset-btn").click(function () {
        $("#sim-apply-settings-btn").click();
    });

    $("#sim-enhance-btn").click(async function () {
        $('#sim-enhance-btn').prop('disabled', true); // Disable button

        play_sound("enchant");

        var current_stars = $('#sim-current-stars').text();
        var next_stars = $('#sim-next-stars').text();

        var temp = get_meso_cost(sim_equip_lvl, current_stars);
        var cur_enhance_cost = temp[0];

        await delay(1000);

        var star_catch_enabled = false;
        var anti_boom_enabled = false;

        if ($("#cancel-star-catch").is(':checked'))
            star_catch_enabled = true

        if ($("#anti-boom").is(':checked:not(:disabled)')) // checked AND not disabled
            anti_boom_enabled = true

        // Call tap function and get results
        tap_res = tap(current_stars, star_catch_enabled, anti_boom_enabled, decrease_count);

        if (tap_res == "Pass") {
            decrease_count = 0;

            $('#sim-current-stars').text(parseInt(current_stars) + 1);
            $('#sim-next-stars').text(parseInt(next_stars) + 1);

            $("#sim-next-stars-strike").css("display", "none");

            // Overriding (1 + 1)
            if (sim_1_plus_1 == true) {
                if (current_stars <= 10) {
                    $('#sim-current-stars').text(parseInt(current_stars) + 2);

                    if (parseInt(current_stars) + 2 <= 10) {
                        $("#sim-next-stars-strike").css("display", "inline-block");
                        $("#sim-next-stars-strike-span").text(parseInt(current_stars) + 3);
                        $('#sim-next-stars').text(parseInt(current_stars) + 4);
                    }
                }
            }

            $("#sim-success-image").fadeIn("fast", function () {
                $("#sim-success-image").fadeOut(1000);
            });

            play_sound("success");
        } else if (tap_res == "Decrease") {
            decrease_count++;

            $('#sim-current-stars').text(parseInt(current_stars) - 1);
            $('#sim-next-stars').text(parseInt(next_stars) - 1);

            $("#sim-fail-image").fadeIn("fast", function () {
                $("#sim-fail-image").fadeOut(1000);
            });

            play_sound("fail");
        } else if (tap_res == "Maintain") {
            decrease_count = 0;

            $("#sim-fail-image").fadeIn("fast", function () {
                $("#sim-fail-image").fadeOut(1000);
            });

            play_sound("fail");
        } else if (tap_res == "Destroyed") {
            decrease_count = 0;

            $("#sim-destroyed-image").fadeIn("fast");

            $("#sim-revive-btn").css("display", "block"); // Display revive button
            $("#sim-enhance-btn").css("display", "none"); // Hide enhance button

            play_sound("destroyed");
        }

        // Check if anti-boom is checked AND valid
        if (anti_boom_enabled == true) { // Here current_stars is the old one (before update)
            cur_enhance_cost = temp[1]; // Anti-boom cost
        }

        new_stars = $('#sim-current-stars').text();

        if (decrease_count == 2) {
            res = [100, false, false, false]; // Chance time
        } else {
            res = get_probabilities(new_stars);
        }

        update_sim_display(res, new_stars); // Update probabilities displayed

        sim_total_cost += parseInt(cur_enhance_cost);

        temp = get_meso_cost(sim_equip_lvl, new_stars);

        // Update and display cost (of next enhancement)
        if ($("#anti-boom").is(':checked:not(:disabled)') && new_stars >= 12 && new_stars <= 16) {
            $('#sim-cost').text(temp[1].toLocaleString("en-US"));
        }
        else {
            $('#sim-cost').text(temp[0].toLocaleString("en-US"));
        }

        $('#sim-total-cost').text(sim_total_cost.toLocaleString("en-US")); // Update and display total cost

        $('#sim-result').text(tap_res); // Display result

        $('#sim-enhance-btn').prop('disabled', false); // Enable button
    });

    function play_sound(sound) {
        // Stop any ongoing sounds
        $('audio').each(function () {
            this.pause(); // Stop playing
            this.currentTime = 0; // Reset time

            this.volume = 0.05; // Adjust volume
        });

        if (sound == "enchant") {
            $('audio#enchant-sound')[0].play()
        } else if (sound == "success") {
            $('audio#success-sound')[0].play()
        } else if (sound == "fail") {
            $('audio#fail-sound')[0].play()
        } else if (sound == "destroyed") {
            $('audio#destroyed-sound')[0].play()
        }
    }

    function delay(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    function update_sim_display(res, current_stars) {
        $('#sim-fail-rate').text("");
        $('#sim-destroy-rate').text("");
        $("#warning-1").css("display", "none");
        $("#warning-2").css("display", "none");
        $("#warning-3").css("display", "none");
        $("#warning-chance-time").css("display", "none");

        if (res[0] != false) { // Success rate
            $('#sim-success-rate').text("Success: " + math.round(res[0], 1) + "%");
        }

        if (res[1] != false) { // Maintain rate
            $('#sim-fail-rate').text("Fail (Maintain): " + math.round(res[1], 1) + "%");
        }

        if (res[2] != false) { // Decrease rate
            $('#sim-fail-rate').text("Fail (Decrease): " + math.round(res[2], 1) + "%");
        }

        if (res[3] != false) { // Destroy rate
            $('#sim-destroy-rate').text("Destroy: " + math.round(res[3], 1) + "%");
        }

        // Update warnings
        if (decrease_count == 2) {
            $("#warning-chance-time").css("display", "block");
        } else {
            if ((current_stars >= 0) && (current_stars < 11)) {
                $("#warning-1").css("display", "block");
            } else if (current_stars == 11) {
                $("#warning-2").css("display", "block");
            } else {
                $("#warning-3").css("display", "block");
            }

            // 5, 10, 15 override
            if (sim_51015 == true && (current_stars == 5 || current_stars == 10 || current_stars == 15)) {
                $("#warning-1").css("display", "block");
                $("#warning-2").css("display", "none");
                $("#warning-3").css("display", "none");

                $('#sim-fail-rate').text("");
                $('#sim-destroy-rate').text("");
            }
        }

        // Check if "ANTI-DESTRUCTION" option should be enabled or disabled
        if (current_stars >= 12 && current_stars <= 16) {
            if (sim_51015 == true && current_stars == 15) // 5, 10 will be disabled anyway, so only need check 15
                $('#anti-boom').prop('disabled', true);
            else
                $('#anti-boom').prop('disabled', false);

            if (sim_no_boom == true && (current_stars == 12 || current_stars == 13 || current_stars == 14))
                $('#anti-boom').prop('disabled', true);
        } else {
            $('#anti-boom').prop('disabled', true);
        }

        // Chance time override
        if (decrease_count == 2)
            $('#anti-boom').prop('disabled', true);
    }

    function get_probabilities(star) { // THIS FUNCTION IS JUST FOR DISPLAYING THE PROBABILITIES IN THE SIM 
        const success_array = [95, 90, 85, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30, 30, 30, 30, 30, 30, 30, 3, 2, 1];
        const maintain_array = [5, 10, 15, 15, 20, 25, 30, 35, 40, 45, 50, false, false, false, false, 67.9, false, false, false, false, 63, false, false, false, false];
        const decrease_array = [false, false, false, false, false, false, false, false, false, false, false, 55, 59.4, 63.7, 68.6, false, 67.9, 67.9, 67.2, 67.2, false, 63, 77.6, 68.6, 59.4];
        const destroy_array = [false, false, false, false, false, false, false, false, false, false, false, false, 0.6, 1.3, 1.4, 2.1, 2.1, 2.1, 2.8, 2.8, 7, 7, 19.4, 29.4, 39.6]

        var success_rate = false;
        var maintain_rate = false;
        var decrease_rate = false;
        var destroy_rate = false;

        success_rate = success_array[star];
        maintain_rate = maintain_array[star];
        decrease_rate = decrease_array[star];
        destroy_rate = destroy_array[star];

        // Override (for no boom - 12, 13, 14 stars)
        if (sim_no_boom == true) {
            if (star == 12) {
                decrease_rate = 60;
                destroy_rate = false;
            } else if (star == 13) {
                decrease_rate = 65;
                destroy_rate = false;
            } else if (star == 14) {
                decrease_rate = 70;
                destroy_rate = false;
            }
        }

        // 5, 10, 15
        if (sim_51015 == true && (star == 5 || star == 10 || star == 15)) {
            success_rate = 100;
        }

        return [success_rate, maintain_rate, decrease_rate, destroy_rate];
    }

    ////////////////

    function get_meso_cost(equip_level, current_stars) {
        equip_level = math.round(equip_level / 10) * 10; // Equip Level is rounded down to the nearest 10 levels.

        var cost;
        var exponent;
        var constant;

        if (0 <= current_stars && current_stars < 10) {
            exponent = 1;
            constant = 2500;
        } else if (10 <= current_stars && current_stars < 15) {
            exponent = 2.7;
            constant = 40000;
        } else if (15 <= current_stars && current_stars < 25) {
            exponent = 2.7
            constant = 20000;
        }

        var temp = (math.pow(equip_level, 3)) * (math.pow((parseInt(current_stars) + 1), exponent) / constant) + 10;
        cost = math.round((temp * 100) / 100) * 100; // Meso cost is rounded off to the nearest hundreds.
        let original_cost = cost;

        var mvp_discount = 0;
        var psc_discount = 0;
        var event_discount = 0;

        if (current_stars <= 16) {
            // MVP
            if (sim_mvp_grade == "Silver") {
                mvp_discount = cost * 0.03;
            } else if (sim_mvp_grade == "Gold") {
                mvp_discount = cost * 0.05;
            } else if (sim_mvp_grade == "Diamond") {
                mvp_discount = cost * 0.1;
            }

            // PSC
            if (sim_psc == "Yes")
                psc_discount = cost * 0.05;
        }

        cost = cost - mvp_discount - psc_discount;

        if (sim_30_disc == true) {
            event_discount = cost * 0.3;
        }

        cost = cost - event_discount;

        // Calculate anti-boom cost 
        var a_cost = 0;

        if (sim_30_disc == true) {
            // Original cost * 2 * Some constant

            if (sim_mvp_grade == "None") {
                a_cost = original_cost * 2 * 0.85;
            } else if (sim_mvp_grade == "Silver") {
                a_cost = original_cost * 2 * 0.8605; // NEED VERIFICATION
            } else if (sim_mvp_grade == "Gold") {
                a_cost = original_cost * 2 * 0.8675; // NEED VERIFICATION
            } else if (sim_mvp_grade == "Diamond") {
                a_cost = original_cost * 2 * 0.815;
            }
        } else {
            a_cost = cost * 2;
        }

        // Round to nearest integer (Need verifications)
        cost = math.round(cost);
        a_cost = math.round(a_cost);

        return [cost, a_cost]
    }

    function tap(current_stars, star_catch, anti_boom, count) {
        // Chance time
        if (count == 2) {
            return "Pass";
        }

        const success_rate_array = [95, 90, 85, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30, 30, 30, 30, 30, 30, 30, 3, 2, 1];

        const rate_array = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99, 98, 98, 97, 97, 97, 96, 96, 90, 90, 80, 70, 60];

        var success_rate;

        if (star_catch)
            success_rate = (success_rate_array[current_stars]) * 1.05;
        else
            success_rate = success_rate_array[current_stars];

        // 5, 10, 15
        if (sim_51015 == true && (current_stars == 5 || current_stars == 10 || current_stars == 15)) {
            success_rate = 100;
        }

        if (probability(success_rate)) { // Success
            return "Pass";
        } else { // Failed
            // Check if maintain, decrease, or destroy

            const type_1_stars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20]; // These types can only either maintain or destroy
            var type_1 = false;
            var type_2 = false;

            if (type_1_stars.includes(parseInt(current_stars)))
                type_1 = true;
            else
                type_2 = true; // These types can only either decrease or destroy


            var odds = 0;

            // Anti boom checked
            if (anti_boom == true)
                odds = 100;
            else
                odds = rate_array[current_stars];

            // No boom up to 15 (12, 13, 14 stars)
            if (sim_no_boom == true && (current_stars == 12 || current_stars == 13 || current_stars == 14))
                odds = 100;

            if (probability(odds)) {
                if (type_1)
                    return "Maintain";
                if (type_2)
                    return "Decrease";
            } else { // Destroyed
                return "Destroyed";
            }
        };
    }

    // Function to test probability
    function probability(rate) {
        return math.random() < (rate / 100);
    }
})


