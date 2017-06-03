convert puyos.xcf -crop 16x16 -sample 400% cropped_puyo_%03d.png
convert cropped_puyo_000.png -sample 800% png32:icon.png
mv cropped_puyo_000.png ../assets/puyo_red.png
mv cropped_puyo_001.png ../assets/puyo_green.png
mv cropped_puyo_002.png ../assets/puyo_blue.png
mv cropped_puyo_003.png ../assets/puyo_yellow.png

convert noticingPuyos.xcf -crop 16x16 -sample 400% cropped_ojama_%03d.png
mv cropped_ojama_000.png ../assets/ojama_small.png
mv cropped_ojama_001.png ../assets/ojama_large.png
mv cropped_ojama_002.png ../assets/ojama_stone.png
mv cropped_ojama_003.png ../assets/ojama_mushroom.png
mv cropped_ojama_004.png ../assets/ojama_star.png
mv cropped_ojama_005.png ../assets/ojama_crown.png

convert misc.xcf -crop 16x16 -sample 400% cropped_misc_%03d.png
mv cropped_misc_000.png ../assets/cross.png

convert controls.xcf -crop 32x32 -sample 400% cropped_controls_%03d.png
mv cropped_controls_000.png ../assets/control_a.png
mv cropped_controls_001.png ../assets/control_b.png
mv cropped_controls_002.png ../assets/control_left.png
mv cropped_controls_003.png ../assets/control_right.png
mv cropped_controls_004.png ../assets/control_down.png

rm -f cropped_*