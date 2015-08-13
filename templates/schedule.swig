<!DOCTYPE //>
<html lang="en">
  <head>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <!-- Latest compiled and minified CSS-->
    <!--link(rel='stylesheet', href='http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css')-->
    <!-- Optional theme-->
    <!--link(rel='stylesheet', href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css')-->
    <!-- Latest compiled and minified JavaScript-->
    <!--script(src='http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js')-->
    <!--css-->
    <!--link(href='http://sites.simbla.com/static/css/bootstrap3.min.css', rel='stylesheet')-->
    <link href="http://static.triballabs.net/Bootstrap/css/bootstrap.css" rel="stylesheet"/>
    <link href="http://static.triballabs.net/Bootstrap/css/bootstrap-responsive.css" rel="stylesheet"/>
    <link href="http://static.triballabs.net/Bootstrap/css/bootstrap.css" rel="stylesheet"/>
    <link href="http://static.triballabs.net/Bootstrap/css/bootstrap-responsive.css" rel="stylesheet"/>
    <link href="http://static.triballabs.net/Bootstrap/css/docs.css" rel="stylesheet"/>
    <link href="http://static.triballabs.net/Bootstrap/css/tribal-bootstrap.css" rel="stylesheet"/>
    <link href="http://static.triballabs.net/Bootstrap/css/tribal-timetable.css" rel="stylesheet"/>
    <!--script(type='text/javascript',src='http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js')-->
    <!--script(type='text/javascript',src='http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js')-->
    <!--script(type='text/javascript',src='https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js')-->
    <!--///////////////////////-->
    <!--script(type='text/javascript', src='http://static.triballabs.net/Bootstrap/js/jquery-latest.js')-->
    <script type="text/javascript" src="http://static.triballabs.net/Bootstrap/js/jquery.ba-resize.js"></script>
    <script type="text/javascript" src="http://static.triballabs.net/Bootstrap/js/bootstrap-tooltip.js"></script>
    <script type="text/javascript" src="http://static.triballabs.net/Bootstrap/js/bootstrap-collapse.js"></script>
    <script type="text/javascript" src="http://static.triballabs.net/Bootstrap/js/tribal.js"></script>
    <script type="text/javascript" src="http://static.triballabs.net/Bootstrap/js/tribal-shared.js"></script>
    <script type="text/javascript" src="http://static.triballabs.net/Bootstrap/js/tribal-timetable.js"></script>
    <title>RACOS</title>
  </head>
  <body data-offset="80">
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <button type="button" data-toggle="collapse" data-target="#racos-navbar-collapse" class="btn btn-navbar"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a href="/" class="brand">RACOS</a>
          <div id="#racos-navbar-collapse" class="nav-collapse collapse">
            <ul class="nav">
              <li class="active"><a href="/schedule">Schedule</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>    
    <div class="container">
      <header id="overview" class="jumbotron subhead">
        <h2>ClassRoom Schedule</h2>
      </header>
  
    <div class="input">
      <form role="form" class="form-inline">
        <div class="room-group">
          <label for="selectRoom" style="float:left;padding: 10px 0px 0px 0px;">Room : </label>
            <select id="selectRoom" style="width:auto;margin: 5px;" class="form-control selectWidth">
              <!--each room in rooms.roomrecord//option
              -->
              <option>BKD3201 TYPE: Lab Seat 60           </option>
              <option>BKD3202 TYPE: Lab Seat 60   </option>
              <option>BKD3206 TYPE: Lecture Seat 40 </option>
            </select>
        </div>
      <div class="week-group">
        <label for="selectRoom" style="float:left;padding: 10px 0px 0px 0px;">Week : </label>
        <select id="selectWeek" style="width:auto;margin: 5px;" class="form-control selectWidth">
          <option>17/8/2015 - 23/8/2015</option>
        </select>
      </div>
    </form>
    </div>
      <div data-days="7" data-hours="9" class="timetable">
        <ul class="tt-events">
      <li data-id="10" data-day="5" data-start="4.16" data-duration="0.2" class="tt-event btn-success">Maths 1<br/>                    12:10 - 12:20<br/>                    BKD3201 Lecture</li>
      
    </ul>
    <div class="tt-times">
      <div data-time="0" class="tt-time">08<span class="hidden-phone">.00</span></div>
      <div data-time="1" class="tt-time">9<span class="hidden-phone">.00</span></div>
      <div data-time="2" class="tt-time">10<span class="hidden-phone">.00</span></div>
      <div data-time="3" class="tt-time">11<span class="hidden-phone">.00</span></div>
      <div data-time="4" class="tt-time">12<span class="hidden-phone">.00</span></div>
      <div data-time="5" class="tt-time">13<span class="hidden-phone">.00</span></div>
      <div data-time="6" class="tt-time">14<span class="hidden-phone">.00</span></div>
      <div data-time="7" class="tt-time">15<span class="hidden-phone">.00</span></div>
      <div data-time="8" class="tt-time">16<span class="hidden-phone">.00</span></div>
      <!--.tt-time(data-time='9')
      | 17
      span.hidden-phone .00
      -->
    </div>
    <div class="tt-days">
      <div data-day="0" class="tt-day">M<span class="hidden-phone">on</span></div>
      <div data-day="1" class="tt-day">T<span class="hidden-phone">ue</span></div>
      <div data-day="2" class="tt-day">W<span class="hidden-phone">ed</span></div>
      <div data-day="3" class="tt-day">T<span class="hidden-phone">hu</span></div>
      <div data-day="4" class="tt-day">F<span class="hidden-phone">ri</span></div>
      <div data-day="5" class="tt-day">S<span class="hidden-phone">at</span></div>
      <div data-day="6" class="tt-day">S<span class="hidden-phone">un</span></div>
    </div>
  </div>
 
    
</div>
        
  </body>
</html>


