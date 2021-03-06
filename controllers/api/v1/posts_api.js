const Post = require('../../../models/post');
const Comment = require('../../../models/comment');


module.exports.index = async function(req, res){
    try{
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            }
        });
        
        return res.json(200, {
            data: {
                posts: posts
            },
            message: 'All posts'
        });
    } catch(err){
        return res.json(500, {
            data: {
                posts: []
            },
            message: 'Internal Server Error'
        });
    }
}

//Action to delete a post after JWT authentication
module.exports.destroy = async function(req, res){
    try{
        let post = await Post.findById(req.params.id); 
        if(post.user == req.user.id){
            post.remove();
            await Comment.deleteMany({post: post._id});
            return res.json(200, {
                message: 'Post is deleted successfully'
            });
        } else {
            return res.json(422, {
                message: 'Unauthorized to delete'
            })
        }
        
    } catch(err){
        return res.json(500, {
            message: 'Internal Server Error'
        });
    }
}