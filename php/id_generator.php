<?php

function idGenerator($mysqli, $column_name, $table_name)
{
    $query = $mysqli->prepare(
        "SELECT $column_name
            FROM $table_name
            ORDER BY $column_name DESC
            LIMIT 1"
    );

    if (!$query) {
        return "Error: Query preparation failed.";
    }

    $query->execute();
    $result = $query->get_result();
    $last_row = $result->fetch_assoc();

    $latest_id = null;
    $prefix_length = 0;

    if ($last_row) {
        $latest_id = $last_row[$column_name];
    } else {
        switch ($table_name) {
            case 'prescription':
            case 'doctors':
            case 'admins':
                $prefix_length = 1;

                if ($table_name == 'prescription') $latest_id = "P0000";
                if ($table_name == 'doctors') $latest_id = "D0000";
                if ($table_name == 'admins') $latest_id = "A0000";
                break;
            case 'patients':
            case 'pharmacists':
            case 'pharmacy_managers':
                $prefix_length = 2;

                if ($table_name == 'patients') $latest_id = "PA0000";
                if ($table_name == 'pharmacists') $latest_id = "PH0000";
                if ($table_name == 'pharmacy_managers') $latest_id = "PM0000";
                break;
            case 'medicines':
                $prefix_length = 3;
                $latest_id = "MED0000";
                break;
            default:
                return "Error: Unknown table name provided.";
        }
    }

    if ($table_name == 'prescription' || $table_name == 'doctors' || $table_name == 'admins') {
        $prefix_length = 1;
    } elseif ($table_name == 'patients' || $table_name == 'pharmacists' || $table_name == 'pharmacy_managers') {
        $prefix_length = 2;
    } elseif ($table_name == 'medicine') {
        $prefix_length = 3;
    }

    if ($latest_id === null) {
        return "Error: ID could not be determined.";
    }

    return generateNextId($latest_id, $prefix_length);
}

function generateNumericalPart($target_id, $num_of_letters_in_prefix)
{
    $prefix = substr($target_id, 0, $num_of_letters_in_prefix);
    $num_str = substr($target_id, $num_of_letters_in_prefix);

    $num_length = strlen($num_str);
    $latest_num = (int)$num_str;
    $generated_num = $latest_num + 1; //increment id
    $new_num_str = sprintf("%0{$num_length}d", $generated_num);

    return $prefix . $new_num_str;
}
