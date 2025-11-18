<?php include('header.php'); ?>
<?php include('config.php'); ?>

<h1 id="main_title">List of Current Prescription</h1>
<a class="btn create-prescription" href="../doctor_module/php/create.php">Create Prescription</a>
<table class="table table-hover table-bordered table-striped" id="recent_table">
    <thead>
        <tr>
            <th>Prescription ID</th>
            <th>Patient ID</th>
            <th>Date</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <!-- Reading of database prescription -->

        <?php
        $query = "select prescriptionid, patient_id, date_created, status from `prescription`";

        $result = mysqli_query($connection, $query);

        if (!$result) {
            die("Can't retrieve database");
        } else {
            // prints the results not the data
            // print_r($result);

            // populate display
            while ($row = mysqli_fetch_assoc($result)) {
        ?>
                <tr>
                    <td><?php echo $row['prescriptionid']; ?></td>
                    <td><?php echo $row['patient_id']; ?></td>
                    <td><?php echo $row['date_created']; ?></td>
                    <td><?php echo $row['status']; ?></td>
                </tr>
        <?php
            }
        }

        ?>
    </tbody>
</table>

<?php include('footer.php'); ?>