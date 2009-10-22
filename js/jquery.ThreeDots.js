/**
 * @author Jeremy Horn
 */

(function($) {
	$.fn.ThreeDots = function(options) {

		// check for new & valid options
		if ((typeof options == 'object') || (options == undefined)) {
			$.fn.ThreeDots.the_selected = this;

			var return_value = $.fn.ThreeDots.update(options);

		}
		
		return return_value;
	};

	$.fn.ThreeDots.update = function(options) {
		// initialize local variables
		var curr_this, last_word = null;
		var lineh, paddingt, paddingb, innerh, temp_height;
		var curr_text_span, lws; /* last word structure */
		var last_text, three_dots_value;

		// check for new & valid options
		if ((typeof options == 'object') || (options == undefined)) {

			// then update the settings
			$.extend($.fn.ThreeDots.settings, options);
			var max_rows = $.fn.ThreeDots.settings.max_rows;
			if (max_rows < 1) {
				return $.fn.ThreeDots.the_selected;
			}
			
			// process all provided objects
			$.fn.ThreeDots.the_selected.each(function() {
				// element-specific code here
				curr_this = $(this);
				
				// obtain the text span
				curr_text_span = $(curr_this).children('.'+$.fn.ThreeDots.settings.text_span_class).get(0);
				if ($(curr_text_span).length == 0) { 
					// if span doesnt exist, then go to next
					return true;
				}

				// if the object has been initialized, then user must be calling UPDATE
				// THEREFORE refresh the text area before re-operating
				if ((three_dots_value = $(curr_this).attr('threedots')) != undefined) {
					$(curr_text_span).text(three_dots_value);						
					$(curr_this).children('.'+$.fn.ThreeDots.settings.e_span_class).remove();
				}

				
				last_text = $(curr_text_span).text();
				if (last_text.length <= 0) {
					last_text = '';
				}
				$(curr_this).attr('threedots', last_text);
				//alert(num_rows(curr_this)+':'+max_rows);
				if (num_rows(curr_this) > max_rows) {
					// append the ellipsis span & remember the original text
					/*alert('<span class="'	+ $.fn.ThreeDots.settings.text_span_class + '">'
														+ $.fn.ThreeDots.settings.delimitor_string 
														+ '</span>');*/
					$(curr_this).append('<span style="white-space:nowrap" class="'	
														+ $.fn.ThreeDots.settings.e_span_class + '">'
														+ $.fn.ThreeDots.settings.ellipsis_string 
														+ '</span>');
	
					// remove 1 word at a time UNTIL max_rows
					while (num_rows(curr_this) > max_rows) {
						
						lws = the_last_word($(curr_text_span).text());

						$(curr_text_span).text(lws.updated_string);
						last_word = lws.word;
						last_del = lws.del;
						
						if (lws.del == null) {
							break;					
						}
					}
	
					// check for super long words
					if (last_word != null) {
						var is_dangling = dangling_ellipsis(curr_this);//alert(is_dangling);
						if ((num_rows(curr_this) == max_rows - 1) || (is_dangling)) {
							last_text = $(curr_text_span).text();
							if (lws.del != null) {
								$(curr_text_span).text(last_text + last_del);
							}
									
							if (num_rows(curr_this) > max_rows) {
								// undo what i just did and stop
								$(curr_text_span).text(last_text);
							} else {
								// keep going
								$(curr_text_span).text($(curr_text_span).text() + last_word);
								
								// break up the last word IFF (1) word is longer than a line, OR (2) whole_word == false
								if ((num_rows(curr_this) > max_rows + 1) 
									|| (!$.fn.ThreeDots.settings.whole_word)
									|| is_dangling) {
									// remove 1 char at a time until it all fits
									while (num_rows(curr_this) > max_rows) {
										if ($(curr_text_span).text().length > 0) {
											$(curr_text_span).text(
												$(curr_text_span).text().substr(0, $(curr_text_span).text().length - 1)
											);
										} else {
											/* 
											 there is no hope for you; you are crazy;
											 either pick a shorter ellipsis_string OR
											 use a wider object --- geeze!
											 */
											break;
										}
									}							
								}
							}
						}
					}
				}				
			});
		}
		
		return $.fn.ThreeDots.the_selected;
	};

	
	$.fn.ThreeDots.settings = {
		valid_delimitors: 	[' ', ',', '.'], // what defines the bounds of a word to you?
		ellipsis_string: 	'...',
		max_rows:			2,
		text_span_class:	'ellipsis_text',
		e_span_class:		'threedots_ellipsis',
		whole_word:			true,
		allow_dangle:		false
	
		/*
		  
		  alt-text-e: true // mouse over of ellipsis displays the full text
		  alt-text-t: true // if ellipsis displayed, mouse over of text displays the full text
		  
		  if you want something to behave like a link (or whatever), use $().wrap()
		 */
	};

	function dangling_ellipsis(obj){
		if ($.fn.ThreeDots.settings.allow_dangle == true) {
			return false; // why do when no doing need be done?
		}
		
		// initialize variables
		var ellipsis_obj 		= $(obj).children('.'+$.fn.ThreeDots.settings.e_span_class).get(0);
		var remember_display 	= $(ellipsis_obj).css('display');
		var num_rows_before 	= num_rows(obj);
		
		// temporarily hide ellipsis
		$(ellipsis_obj).css('display','none');
		var num_rows_after 		= num_rows(obj);

		// restore ellipsis
		$(ellipsis_obj).css('display',remember_display);
		
		if (num_rows_before > num_rows_after) {
			return true; 	// ASSUMPTION: 	removing the ellipsis changed the height
							// 				THEREFORE the ellipsis was on a row all by its lonesome
		} else {
			return false;	// nothing dangling here
		}
	}

	function num_rows(obj){
		// only need to calculate once
		if (typeof this.paddingt == 'undefined') {
			// ASSUMPTION:  assuming padding returned ALWAYS in pixel scale 
			this.paddingt 	= parseInt(($(obj).css('padding-top')).replace('px', ''));
			this.paddingb 	= parseInt(($(obj).css('padding-bottom')).replace('px', ''));
			this.lineheight	= lineheight_px($(obj));
		}
		
		// do the math
		var innerh = parseInt($(obj).innerHeight()); // get the latest height
		
		var n_rows = (innerh - (paddingt + paddingb)) / lineheight;
		
		return n_rows;
	}
	
	function the_last_word(str){
		var temp_word_index;
		var v_del = $.fn.ThreeDots.settings.valid_delimitors;
		
		// trim the string
		str = jQuery.trim(str);
		
		// initialize variables
		var lastest_word_idx = -1;
		var lastest_word = null;
		var lastest_del = null;
		
		// for all given delimiters, determine which delimiter results in the smallest word cut
		jQuery.each(v_del, function(i, curr_del){
			tmp_word_index = str.lastIndexOf(curr_del);
			if (tmp_word_index != -1) {
				if (tmp_word_index > lastest_word_idx) {
					lastest_word_idx 	= tmp_word_index;
					lastest_word 		= str.substring(lastest_word_idx);
					lastest_del			= curr_del;
				}
			}
		});
		
		// return data structure of word reduced string and the last word
		if (lastest_word_idx > 0) {
			return {
				updated_string:	jQuery.trim(str.substring(0, lastest_word_idx/*-1*/)),
				word: 			lastest_word,
				del: 			lastest_del
			};
		} else {
			return {
				updated_string:	'',
				word: 			jQuery.trim(str),
				del: 			null
			};
		}
	}
			
	function lineheight_px(obj) {
		$(obj).append("<div id='temp_ellipsis_div' style='position:absolute; visibility:hidden'>H</div>");
		var temp_height = $('#temp_ellipsis_div').height();
		$('#temp_ellipsis_div').remove();

		return temp_height;
	}
})(jQuery);