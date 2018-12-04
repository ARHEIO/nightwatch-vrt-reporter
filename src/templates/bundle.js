function toggleModal(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  if(!target.id) {
    $("#modal").hide();
  } else {
    $("#modal-image").attr('src', '../dif-screenshots/' + target.id);
    $("#modal").show();
  }
}

$(document).ready(
  function(){
    $("#modal").hide();
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { $("#modal").hide(); }
    });
  }
);