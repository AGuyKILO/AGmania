local newx = 410
function onCreatePost()
noteTweenX('bf',  4, newx, 5, 'expoOut')
noteTweenX('bf1', 5,newx + 120, 5, 'expoOut')
noteTweenX('bf2', 6, newx + 230, 5, 'expoOut')
noteTweenX('bf3', 7, newx + 360, 5, 'expoOut')	
noteTweenX('dad', 0, -500,-10, 'expoOut')
noteTweenX('dad1', 1, -500 +110 ,-10, 'expoOut')
noteTweenX('dad2', 2,-500 +220, -10, 'expoOut')
noteTweenX('dad3', 3, -500 +330, -10, 'expoOut')	
end