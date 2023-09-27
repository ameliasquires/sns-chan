for file in events/defaults/*; do
    cp "$file" events/
done

for folder in commands/*; do
    for file in "$folder"/defaults/*; do
        cp "$file" $folder/
    done
done