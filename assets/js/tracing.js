$(document).ready(function () {
    // Load navbar
    $("#navbar").load("assets/components/navbar.html");

    $("#tracing-form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#calculate-btn").click(function () {
        // Trivial checks

        // Calculate trace success rate
        var base_rate = $("#successRate").val();

        if ($("#fever").is(':checked')) { // Spell trace fever
            if (base_rate == 15) {
                base_rate = 25;
            } else if (base_rate == 30) {
                base_rate = 45;
            } else if (base_rate == 70) {
                base_rate = 95;
            } else {
                base_rate = 100;
            }
        }

        var dilli_lvl = $("#dilliLvl").val();
        if (dilli_lvl > 100 || dilli_lvl < 0) {
            alert("Please enter a valid dilligence level.");
            return;
        }

        var dilli_bonus = math.round(dilli_lvl / 10);
        var guild_bonus_1 = $("#guildEnhancementLvl").val();
        var guild_bonus_2 = $("#guildSalvationLvl").val();
        var trace_rate = +base_rate + +dilli_bonus + +guild_bonus_1;

        var total_slots = $("#totalSlots").val();
        var success_count = $("#noOfSuccess").val();
        var fail_count = $("#noOfFails").val();
        var fail_count_trigger = $("#innoTrigger").val();
        var trace_cost = $("#traceCost").val();
        var inno_type = $("#innoType").val();
        var inno_rate;
        var css_type = $("#cssType").val();
        var css_rate;
        var no_of_sims = $("#noOfSims").val();

        var using_spell_trace_inno = false;
        var using_spell_trace_css = false;

        if ($("#discount").is(':checked')) { // 50% off event
            trace_cost = trace_cost / 2;
        }

        // Inno rate
        if (inno_type == 0) {
            inno_rate = 100;
            using_spell_trace_inno = true;
        } else if (inno_type == 1) {
            inno_rate = 20;
        } else if (inno_type == 2) {
            inno_rate = 40;
        } else if (inno_type == 3) {
            inno_rate = 50;
        } else if (inno_type == 4) {
            inno_rate = 60;
        } else {
            inno_rate = 70;
        }

        // CSS rate
        if (css_type == 0) {
            css_rate = 100;
            using_spell_trace_css = true;
        } else if (css_type == 1) {
            css_rate = 1;
        } else if (css_type == 2) {
            css_rate = 3;
        } else if (css_type == 3) {
            css_rate = 5;
        } else if (css_type == 4) {
            css_rate = 10;
        } else {
            css_rate = 20;
        }

        $('#traceRate').text(trace_rate + '% (' + base_rate + '%+' + dilli_bonus + '%+' + guild_bonus_1 + '%)');
        $('#cssRate').text(css_rate + '%');
        $('#innoRate').text(inno_rate + '%');

        var results;

        var spell_trace_cost_array = [];
        var inno_cost_array = [];
        var css_cost_array = [];
        var meso_cost_array = [];

        var cost_of_spell_trace = $("#costOfSpellTrace").val();
        var cost_of_inno = $("#costOfInno").val();
        var cost_of_css = $("#costOfCSS").val();

        var meso_cost;

        for (var i = 0; i < no_of_sims; i++) {
            results = simulate(trace_rate, css_rate, inno_rate, total_slots, success_count, fail_count, fail_count_trigger, guild_bonus_2, trace_cost, using_spell_trace_inno, using_spell_trace_css);
            spell_trace_cost_array.push(results[0]);
            inno_cost_array.push(results[1]);
            css_cost_array.push(results[2]);

            // Calculate meso cost
            meso_cost = 0;
            meso_cost = (results[0] * cost_of_spell_trace) + (results[1] * cost_of_inno) + (results[2] * cost_of_css);
            meso_cost_array.push(meso_cost);
        }

        var avg_spell_trace_count = math.mean(spell_trace_cost_array);
        var median_spell_trace_count = math.median(spell_trace_cost_array);
        var min_spell_trace_count = math.min(spell_trace_cost_array);
        var max_spell_trace_count = math.max(spell_trace_cost_array);
        var spell_trace_stacks = math.round(avg_spell_trace_count / 9000, 1);

        var avg_inno_count = math.mean(inno_cost_array);
        var median_inno_count = math.median(inno_cost_array);
        var min_inno_count = math.min(inno_cost_array);
        var max_inno_count = math.max(inno_cost_array);

        var avg_css_count = math.mean(css_cost_array);
        var median_css_count = math.median(css_cost_array);
        var min_css_count = math.min(css_cost_array);
        var max_css_count = math.max(css_cost_array);

        var avg_meso_count = math.mean(meso_cost_array);
        var median_meso_count = math.median(meso_cost_array);
        var min_meso_count = math.min(meso_cost_array);
        var max_meso_count = math.max(meso_cost_array);


        $('#avgTraces').text(avg_spell_trace_count.toLocaleString("en-US") + ' (Roughly ' + spell_trace_stacks + ' stacks)');
        $('#rangeTraces').text(min_spell_trace_count.toLocaleString("en-US") + ' - ' + max_spell_trace_count.toLocaleString("en-US"));
        $('#medianTraces').text(median_spell_trace_count.toLocaleString("en-US"));

        $('#avgInno').text(avg_inno_count);
        $('#rangeInno').text(min_inno_count + ' - ' + max_inno_count);
        $('#medianInno').text(median_inno_count);

        $('#avgCSS').text(avg_css_count);
        $('#rangeCSS').text(min_css_count + ' - ' + max_css_count);
        $('#medianCSS').text(median_css_count);

        if (cost_of_spell_trace != 0) {
            $('#avgMeso').text(avg_meso_count.toLocaleString("en-US"));
            $('#rangeMeso').text(min_meso_count.toLocaleString("en-US") + ' - ' + max_meso_count.toLocaleString("en-US"));
            $('#medianMeso').text(median_meso_count.toLocaleString("en-US"));
        }
    });

    // Function to test probability
    function probability(rate) {
        return math.random() < (rate / 100);
    }

    // Simulation function
    function simulate(trace_rate, css_rate, inno_rate, total_slots, success_count, fail_count, fail_count_trigger, guild_bonus_2, trace_cost, using_spell_trace_inno, using_spell_trace_css) {

        var spell_trace_count = 0;
        var inno_count = 0;
        var css_count = 0;

        // Phase 1 (Trace until we are satisfied with the fail count)
        while ((total_slots - success_count - fail_count) > 0) { // Run while loop until no more slots left
            if (probability(trace_rate)) { // Pass trace
                spell_trace_count += +trace_cost;
                success_count++;
            }
            else { // Failed trace
                // Guild upgrade salvation - When you fail a scroll or Spell Trace enhancement, there's a chance the upgrade count will not be consumed.
                if (!probability(guild_bonus_2)) {
                    fail_count++;
                }

                if (fail_count >= fail_count_trigger) { // Inno time
                    // While loop, till inno passes
                    while (1) {
                        inno_count++;

                        if (using_spell_trace_inno) { // Using spell trace inno
                            if ($("#discount").is(':checked')) {
                                spell_trace_count += 6000;
                            } else {
                                spell_trace_count += 12000;
                            }
                        }

                        if (probability(inno_rate)) { // Inno pass
                            success_count = 0;
                            fail_count = 0;
                            break;
                        }
                    }
                }

                spell_trace_count += +trace_cost;
            }
        }

        // Phase 2 (CSS + Perf trace remaining)
        while (success_count != total_slots) {
            if (total_slots - success_count - fail_count > 0) { // Trace if a slot exists
                if (probability(trace_rate)) {
                    success_count++;
                } else {
                    if (!probability(guild_bonus_2)) {
                        fail_count++;
                    }
                }
            } else { // Else apply CSS until one passes
                while (1) {
                    css_count++;

                    if (using_spell_trace_css) {
                        if ($("#discount").is(':checked'))
                            spell_trace_count += 10000;
                        else
                            spell_trace_count += 20000;
                    }

                    if (probability(css_rate)) { // CSS pass
                        fail_count--;
                        break;
                    }
                }
            }
        }

        // Return results
        return [spell_trace_count, inno_count, css_count];
    }
})


