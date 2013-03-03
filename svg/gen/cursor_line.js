function on_mouse_move(event) {
	if (event.clientX > [XSTART] && event.clientX < [XEND]) {
		document.getElementById("cursor_line").setAttribute("display","inherit");
		document.getElementById("cursor_line").setAttribute("transform", "translate(" + event.clientX + ", 0)");
	} else {
		document.getElementById("cursor_line").setAttribute("display","none");
	}
}
function null_handler(event) {}
