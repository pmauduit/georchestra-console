package org.georchestra.console.boot;

import org.georchestra.console.ConsoleApplication;
import org.springframework.boot.SpringApplication;

public class TestConsoleApplication {

	public static void main(String[] args) {
		SpringApplication.from(ConsoleApplication::main).run(args);
	}

}
