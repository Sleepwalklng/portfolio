jQuery(document).ready(function($){
	var secondaryNav = $('.main-nav'),
		secondaryNavTopPosition = secondaryNav.offset().top + $('#main-nav__intro').height() + parseInt($('#main-nav__intro').css('paddingTop').replace('px', '')),
		contentSections = $('.cd-section');		// скролл от главной навигации к контенту

	$(window).on('scroll', function(){
		if($(window).scrollTop() > secondaryNavTopPosition ) {
			secondaryNav.addClass('is-fixed');
		} else {
			secondaryNav.removeClass('is-fixed');
		}
		updateSecondaryNavigation();
	});			// фиксированное меню

	function updateSecondaryNavigation() {
		contentSections.each(function(){
			var actual = $(this),
				actualHeight = actual.height() + parseInt(actual.css('paddingTop').replace('px', '')) + parseInt(actual.css('paddingBottom').replace('px', '')),
				actualAnchor = secondaryNav.find('a[href="#'+actual.attr('id')+'"]');
			if ( ( actual.offset().top - secondaryNav.height() <= $(window).scrollTop() ) && ( actual.offset().top +  actualHeight - secondaryNav.height() > $(window).scrollTop() ) ) {
				actualAnchor.addClass('active');
			}else {
				actualAnchor.removeClass('active');
			}
		});
	}			// навигация становится активной при просмотре контента

	$('.main-nav__toggle').on('click', function(event){
		event.preventDefault();
		$(this).toggleClass('menu-is-open');
		secondaryNav.find('ul').toggleClass('is-visible');
	});				// Открывает меню на мобильном

	secondaryNav.find('ul a').on('click', function(event){
        event.preventDefault();
        var target= $(this.hash);
        $('body,html').animate({
        	'scrollTop': target.offset().top - secondaryNav.height() + 1
        	}, 400
        ); 
        $('.main-nav__toggle').removeClass('menu-is-open');
        secondaryNav.find('ul').removeClass('is-visible');
    });		// при клике по пункту меню на мобильном скроллит до контента 

	$('.main-nav').on('click', function(event){
		if($(event.target).is('.main-nav')) $(this).children('ul').toggleClass('is-visible');
	});
});			// при клике открывает меню на мобильном