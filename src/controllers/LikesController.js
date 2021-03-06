/* eslint-disable camelcase */
const Like = require('../models/Likes')
const User = require('../models/Users')

module.exports = {

  async likeUser (req, res) {
    const { matcher_id, matched_id, sta_like } = req.body

    const matcher = await User.findByPk(matcher_id)
    const matched = await User.findByPk(matched_id)

    const isMatched = await Like.findAll({
      where: {
        matcher_id: matched_id,
        matched_id: matcher_id,
        sta_like: ['R', 'S']
      }
    })

    const like = await Like.create({ matcher_id, matched_id, sta_like })
    const likeType = (sta_like === 'S' || sta_like === 'R') ? 'Liked' : 'Disliked'
    console.log(`${matcher.name} (${matcher.id}) ${likeType} ${matched.name} (${matched.id}).`)

    if (isMatched.length && (sta_like === 'R' || sta_like === 'S')) {
      console.log('It\'s a match!')
    }

    return res.json(like)
  },

  async index (req, res) {
    const like = await Like.findAll()
    return res.json(like)
  },

  async getmatchesof (req, res) {
    const id = req.params.id
    const usersThatLikedBack = await Like.findAll({
      where: {
        matched_id: id,
        sta_like: ['R', 'S']
      },
      attributes: ['matcher_id']
    })

    // Need to transform into vector to pass as argument in next query
    let usersThatLikedBackVectorized = JSON.stringify(usersThatLikedBack)
    usersThatLikedBackVectorized = JSON.parse(usersThatLikedBackVectorized)
    usersThatLikedBackVectorized = usersThatLikedBackVectorized.map(i => i.matcher_id)

    const matches = await Like.findAll({
      where: {
        matcher_id: id,
        matched_id: usersThatLikedBackVectorized
      }
    })

    return res.json(matches)
  }

}
