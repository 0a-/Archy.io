Router.configure({
  layoutTemplate: 'layout'
});
Router.route('/', function () {
  this.render('home');
});

Router.route('/howArchyWorks', function () {
  this.render('howitworks');
});

Router.route('/tutorial', function () {
  this.render('tutorial');
});

Router.route('/docs', function () {
  this.render('tutorial');
});

Router.route('/demo', function () {
  this.render('tutorial');
});


Router.route('/download', function () {
  this.render('tutorial');
});

Router.route('/plug-ins', function () {
  this.render('tutorial');
});

Router.route('/themes', function () {
  this.render('tutorial');
});