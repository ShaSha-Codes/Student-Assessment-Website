module.exports={
    ensureStudentAuthenticated: function(req,res,next){
        if(req.isAuthenticated() && req.user.role!="teacher"){
            return next();
        }
        req.flash('error_msg','Please login to view this page');
        res.redirect('/student/login');
    }
    ,
    ensureTeacherAuthenticated: function(req,res,next){
        if(req.isAuthenticated() && req.user.role=="teacher"){
            return next();
        }
        req.flash('error_msg','You need to be a teacher to view this page');
        res.redirect('/teacher/login');
    }
}