!function() {
	$('.navbar-item-wrapper a').click(function(e) {
		e.preventDefault();

		$('.outerLayer .col-md-12.container').hide();
		var containerId = $(e.currentTarget).attr('data-container');
		var url = $(e.currentTarget).attr('data-url');
		$('#' + containerId).show();

		if (url && url !== "") {
			$('#' + containerId + " iframe").attr("src", url);
		}
	});
}();