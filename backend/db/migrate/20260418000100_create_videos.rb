class CreateVideos < ActiveRecord::Migration[7.1]
  def change
    create_table :videos do |t|
      t.string :youtube_video_hash, null: false
      t.text :description, null: false
      t.string :title, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :videos, :youtube_video_hash, unique: true
  end
end