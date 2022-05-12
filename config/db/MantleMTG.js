const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MantleMTG', {
    'Child Sku': {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    'Parent Sku': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Mantle SKU': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Product Type': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Product Line': {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Magic the Gathering"
    },
    Category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Parent Product Name': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Product Name': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Condition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Language: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Sale Price': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Average Cost': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Quantity on Hand': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Reorder Point': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Reserve Quantity': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Picking Bin': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Manufacturer SKU': {
      type: DataTypes.STRING,
      allowNull: true
    },
    SKU: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UPC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ALU: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ASIN: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Mantle Resources': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Comments: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Release Date': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Weight: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Height: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Length: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Width: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Short Code': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Set Name': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Rarity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Mana Cost': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Card Type': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Rules Text': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Power: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Toughness: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Flavor Text': {
      type: DataTypes.STRING,
      allowNull: true
    },
    Artist: {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Card Number': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'TCG Low Price': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'TCG Direct Low': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'TCG Market Price': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'TCG Price Date': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Buylist Price': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'multiverseId': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Image': {
      type: DataTypes.STRING,
      allowNull: true
    },
    'Foil': {
      type: DataTypes.STRING,
      allowNull: true
    },
    brand_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    set_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    rarity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    condition_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_created: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_updated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'MantleMTG',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "mantlemtg_brand_id_idx",
        fields: [
          { name: "brand_id" },
          { name: "set_id" },
          { name: "rarity_id" },
          { name: "condition_id" },
        ]
      },
      {
        name: "mantlemtg_pk",
        unique: true,
        fields: [
          { name: "Child Sku" },
        ]
      },
    ]
  });
};
