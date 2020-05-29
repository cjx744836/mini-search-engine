/*
Navicat MySQL Data Transfer

Source Server         : cc
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : db_search_engine

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2020-05-29 15:50:03
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for s_title
-- ----------------------------
DROP TABLE IF EXISTS `s_title`;
CREATE TABLE `s_title` (
  `id` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `host` varchar(255) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
