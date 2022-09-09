$(document).ready(function () {
    
    $("#tracing-form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#calculate-btn").click(function () {
        // Trivial check

        // Calculate trace success rate
        var base_rate = $("#successRate").val();
        
        if($("#fever").is(':checked')) { // Spell trace fever
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
        var dilli_bonus = math.round(dilli_lvl/10);
        var guild_bonus_1 = $("#guildEnhancementLvl").val();
        var guild_bonus_2 = $("#guildSalvationLvl").val();
        var trace_rate = +base_rate + +dilli_bonus + +guild_bonus_1;

        var total_slots = $("#totalSlots").val();
        var success_count = $("#noOfSuccess").val();
        var fail_count = $("#noOfFails").val();
        var fail_count_trigger = $("#innoTrigger").val();
        var trace_cost = $("#traceCost").val();
        var inno_rate = $("#innoType").val();
        var css_type = $("#cssType").val();
        var css_rate;
        var no_of_sims = $("#noOfSims").val();

        if ($("#discount").is(':checked')) {
            trace_cost = trace_cost/2;
        }

        if(($("#fever").is(':checked')) && (inno_rate == 30)) { // Check if fever + using spell trace inno
            inno_rate = 45;
        }

        if(($("#fever").is(':checked')) && (css_type == 0)) { // Fever + using spell trace CSS
            css_rate = 10;
        } else if (css_type == 0) { // No fever + Using spell trace CSS
            css_rate = 5; 
        } else {
            css_rate = css_type; // Normal CSS
        }

        $('#traceRate').text(trace_rate+'% ('+base_rate+'%+'+dilli_bonus+'%+'+guild_bonus_1+'%)');
        $('#cssRate').text(css_rate+'%');
        $('#innoRate').text(inno_rate+'%');

        var total_spell_trace_count = 0;
        var total_inno_count = 0;
        var total_css_count = 0;
        var results;

        for (var i = 0; i < no_of_sims; i++) {
            results = simulate(trace_rate, css_type, css_rate, inno_rate, total_slots, success_count, fail_count, fail_count_trigger, guild_bonus_2, trace_cost);
            total_spell_trace_count += results[0];
            total_inno_count += results[1];
            total_css_count += results[2];
        }

        var avg_spell_trace_count = total_spell_trace_count/no_of_sims;
        var avg_inno_count = total_inno_count/no_of_sims;
        var avg_css_count = total_css_count/no_of_sims;
        var spell_trace_stacks = math.round(avg_spell_trace_count/9000, 1);

        $('#avgTraces').text(avg_spell_trace_count.toLocaleString("en-US")+' (Roughly '+spell_trace_stacks+' stacks)');
        $('#avgInno').text(avg_inno_count);
        $('#avgCSS').text(avg_css_count);
        
    });

    // Function to test probability
    function probability(rate) {
        return math.random() < (rate/100);
    }

    // Simulation function
    function simulate(trace_rate, css_type, css_rate, inno_rate, total_slots, success_count, fail_count, fail_count_trigger, guild_bonus_2, trace_cost) {

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

                        if (inno_rate == 30 || inno_rate == 45) {
                            if ($("#discount").is(':checked')) {
                                spell_trace_count += 2500; 
                            } else {
                                spell_trace_count += 5000;
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

                    if (css_type == 0) {
                        if ($("#discount").is(':checked')) 
                            spell_trace_count += 1000;
                        else 
                            spell_trace_count += 2000;
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


